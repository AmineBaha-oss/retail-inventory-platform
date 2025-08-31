"""
Core forecasting models for demand prediction.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
import logging

logger = logging.getLogger(__name__)


class ProbabilisticForecaster:
    """
    Probabilistic demand forecaster with confidence intervals.
    """
    
    def __init__(self, confidence_level: float = 0.95):
        self.confidence_level = confidence_level
        self.models = {}
        self.scalers = {}
        self.feature_columns = [
            'day_of_week', 'month', 'quarter', 'is_holiday',
            'days_since_last_sale', 'rolling_mean_7d', 'rolling_mean_30d',
            'rolling_std_7d', 'trend', 'seasonality'
        ]
    
    def prepare_features(self, sales_data: pd.DataFrame) -> pd.DataFrame:
        """
        Prepare features for forecasting.
        
        Args:
            sales_data: DataFrame with columns: date, quantity_sold
            
        Returns:
            DataFrame with engineered features
        """
        df = sales_data.copy()
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Time-based features
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        df['quarter'] = df['date'].dt.quarter
        df['days_since_last_sale'] = self._calculate_days_since_last_sale(df)
        
        # Rolling statistics
        df['rolling_mean_7d'] = df['quantity_sold'].rolling(7, min_periods=1).mean()
        df['rolling_mean_30d'] = df['quantity_sold'].rolling(30, min_periods=1).mean()
        df['rolling_std_7d'] = df['quantity_sold'].rolling(7, min_periods=1).std()
        
        # Trend and seasonality
        df['trend'] = np.arange(len(df))
        df['seasonality'] = np.sin(2 * np.pi * df['trend'] / 365.25)
        
        # Fill NaN values
        df = df.fillna(method='ffill').fillna(0)
        
        return df
    
    def _calculate_days_since_last_sale(self, df: pd.DataFrame) -> pd.Series:
        """Calculate days since last sale for each row."""
        days_since = []
        last_sale_idx = -1
        
        for i, row in df.iterrows():
            if row['quantity_sold'] > 0:
                if last_sale_idx == -1:
                    days_since.append(0)
                else:
                    days_since.append((i - last_sale_idx).days)
                last_sale_idx = i
            else:
                if last_sale_idx == -1:
                    days_since.append(0)
                else:
                    days_since.append((i - last_sale_idx).days)
        
        return pd.Series(days_since, index=df.index)
    
    def train(self, sales_data: pd.DataFrame, product_id: str) -> Dict[str, Any]:
        """
        Train forecasting model for a specific product.
        
        Args:
            sales_data: Historical sales data
            product_id: Product identifier
            
        Returns:
            Training results and metrics
        """
        try:
            # Prepare features
            df = self.prepare_features(sales_data)
            
            # Split data
            train_size = int(len(df) * 0.8)
            train_df = df[:train_size]
            test_df = df[train_size:]
            
            if len(train_df) < 30:
                raise ValueError(f"Insufficient data for product {product_id}. Need at least 30 days.")
            
            # Prepare training data
            X_train = train_df[self.feature_columns]
            y_train = train_df['quantity_sold']
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            
            # Train model
            model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
            model.fit(X_train_scaled, y_train)
            
            # Store model and scaler
            self.models[product_id] = model
            self.scalers[product_id] = scaler
            
            # Evaluate on test set
            X_test = test_df[self.feature_columns]
            y_test = test_df['quantity_sold']
            X_test_scaled = scaler.transform(X_test)
            
            y_pred = model.predict(X_test_scaled)
            
            # Calculate metrics
            mae = mean_absolute_error(y_test, y_pred)
            mse = mean_squared_error(y_test, y_pred)
            rmse = np.sqrt(mse)
            
            # Calculate confidence intervals using model predictions
            predictions = []
            for _ in range(100):
                # Bootstrap prediction
                sample_indices = np.random.choice(len(X_test_scaled), len(X_test_scaled), replace=True)
                X_sample = X_test_scaled[sample_indices]
                y_sample = y_test.iloc[sample_indices]
                
                # Train on sample
                sample_model = RandomForestRegressor(n_estimators=50, random_state=np.random.randint(1000))
                sample_model.fit(X_sample, y_sample)
                
                # Predict
                sample_pred = sample_model.predict(X_test_scaled)
                predictions.append(sample_pred)
            
            predictions = np.array(predictions)
            confidence_lower = np.percentile(predictions, (1 - self.confidence_level) * 100 / 2, axis=0)
            confidence_upper = np.percentile(predictions, (1 + self.confidence_level) * 100 / 2, axis=0)
            
            results = {
                'product_id': product_id,
                'mae': mae,
                'mse': mse,
                'rmse': rmse,
                'confidence_lower': confidence_lower.tolist(),
                'confidence_upper': confidence_upper.tolist(),
                'training_samples': len(train_df),
                'test_samples': len(test_df),
                'feature_importance': dict(zip(self.feature_columns, model.feature_importances_))
            }
            
            logger.info(f"Model trained successfully for product {product_id}. MAE: {mae:.2f}, RMSE: {rmse:.2f}")
            return results
            
        except Exception as e:
            logger.error(f"Error training model for product {product_id}: {str(e)}")
            raise
    
    def forecast(self, product_id: str, horizon_days: int, 
                 last_sales_data: pd.DataFrame) -> Dict[str, Any]:
        """
        Generate forecast for a product.
        
        Args:
            product_id: Product identifier
            horizon_days: Number of days to forecast
            last_sales_data: Recent sales data for feature generation
            
        Returns:
            Forecast results with confidence intervals
        """
        if product_id not in self.models:
            raise ValueError(f"No trained model found for product {product_id}")
        
        try:
            model = self.models[product_id]
            scaler = self.scalers[product_id]
            
            # Generate future dates
            last_date = last_sales_data['date'].max()
            future_dates = pd.date_range(
                start=last_date + timedelta(days=1),
                periods=horizon_days,
                freq='D'
            )
            
            # Prepare future features
            future_df = pd.DataFrame({'date': future_dates})
            future_df['day_of_week'] = future_df['date'].dt.dayofweek
            future_df['month'] = future_df['date'].dt.month
            future_df['quarter'] = future_df['date'].dt.quarter
            
            # Use last known values for rolling features
            last_rolling_mean_7d = last_sales_data['quantity_sold'].tail(7).mean()
            last_rolling_mean_30d = last_sales_data['quantity_sold'].tail(30).mean()
            last_rolling_std_7d = last_sales_data['quantity_sold'].tail(7).std()
            
            future_df['days_since_last_sale'] = np.arange(1, horizon_days + 1)
            future_df['rolling_mean_7d'] = last_rolling_mean_7d
            future_df['rolling_mean_30d'] = last_rolling_mean_30d
            future_df['rolling_std_7d'] = last_rolling_mean_7d
            
            # Trend and seasonality
            last_trend = len(last_sales_data)
            future_df['trend'] = np.arange(last_trend, last_trend + horizon_days)
            future_df['seasonality'] = np.sin(2 * np.pi * future_df['trend'] / 365.25)
            
            # Prepare features for prediction
            X_future = future_df[self.feature_columns]
            X_future_scaled = scaler.transform(X_future)
            
            # Generate predictions
            base_predictions = model.predict(X_future_scaled)
            
            # Generate confidence intervals using bootstrap
            bootstrap_predictions = []
            for _ in range(100):
                # Sample from training data residuals
                residuals = model.predict(scaler.transform(last_sales_data[self.feature_columns])) - last_sales_data['quantity_sold']
                noise = np.random.choice(residuals, size=horizon_days, replace=True)
                
                # Add noise to base predictions
                noisy_pred = base_predictions + noise
                bootstrap_predictions.append(noisy_pred)
            
            bootstrap_predictions = np.array(bootstrap_predictions)
            
            # Calculate confidence intervals
            confidence_lower = np.percentile(bootstrap_predictions, (1 - self.confidence_level) * 100 / 2, axis=0)
            confidence_upper = np.percentile(bootstrap_predictions, (1 + self.confidence_level) * 100 / 2, axis=0)
            
            # Ensure non-negative predictions
            base_predictions = np.maximum(base_predictions, 0)
            confidence_lower = np.maximum(confidence_lower, 0)
            confidence_upper = np.maximum(confidence_upper, 0)
            
            forecast_results = {
                'product_id': product_id,
                'forecast_dates': future_dates.strftime('%Y-%m-%d').tolist(),
                'forecasted_quantities': base_predictions.tolist(),
                'confidence_lower': confidence_upper.tolist(),
                'confidence_level': self.confidence_level,
                'horizon_days': horizon_days,
                'model_version': '1.0.0'
            }
            
            logger.info(f"Forecast generated for product {product_id}, horizon: {horizon_days} days")
            return forecast_results
            
        except Exception as e:
            logger.error(f"Error generating forecast for product {product_id}: {str(e)}")
            raise
