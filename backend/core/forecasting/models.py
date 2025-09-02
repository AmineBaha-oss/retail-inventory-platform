"""
Core forecasting models for demand prediction using Prophet.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime, timedelta
import logging
from prophet import Prophet
from prophet.diagnostics import cross_validation, performance_metrics
import warnings

warnings.filterwarnings('ignore')
logger = logging.getLogger(__name__)


class ProphetForecaster:
    """
    Probabilistic demand forecaster using Facebook Prophet with P50/P90 quantiles.
    """
    
    def __init__(self, 
                 confidence_level: float = 0.95,
                 seasonality_mode: str = 'multiplicative',
                 changepoint_prior_scale: float = 0.05,
                 seasonality_prior_scale: float = 10.0):
        self.confidence_level = confidence_level
        self.seasonality_mode = seasonality_mode
        self.changepoint_prior_scale = changepoint_prior_scale
        self.seasonality_prior_scale = seasonality_prior_scale
        self.models = {}
        self.performance_metrics = {}
        
    def prepare_data_for_prophet(self, sales_data: pd.DataFrame) -> pd.DataFrame:
        """
        Prepare sales data for Prophet format (ds, y).
        
        Args:
            sales_data: DataFrame with columns: date, quantity_sold
            
        Returns:
            DataFrame in Prophet format with columns: ds, y
        """
        df = sales_data.copy()
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Prophet expects 'ds' for dates and 'y' for values
        prophet_df = pd.DataFrame({
            'ds': df['date'],
            'y': df['quantity_sold']
        })
        
        # Remove rows with NaN values
        prophet_df = prophet_df.dropna()
        
        # Ensure y values are non-negative
        prophet_df['y'] = np.maximum(prophet_df['y'], 0)
        
        return prophet_df
    
    def train(self, sales_data: pd.DataFrame, product_id: str, 
              store_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Train Prophet forecasting model for a specific product/store combination.
        
        Args:
            sales_data: Historical sales data
            product_id: Product identifier
            store_id: Store identifier (optional)
            
        Returns:
            Training results and performance metrics
        """
        try:
            # Prepare data for Prophet
            prophet_df = self.prepare_data_for_prophet(sales_data)
            
            if len(prophet_df) < 30:
                raise ValueError(f"Insufficient data for product {product_id}. Need at least 30 days.")
            
            # Create and configure Prophet model
            model = Prophet(
                seasonality_mode=self.seasonality_mode,
                changepoint_prior_scale=self.changepoint_prior_scale,
                seasonality_prior_scale=self.seasonality_prior_scale,
                daily_seasonality=False,
                weekly_seasonality=True,
                yearly_seasonality=True,
                interval_width=self.confidence_level
            )
            
            # Add custom seasonalities for retail
            model.add_seasonality(
                name='monthly', 
                period=30.5, 
                fourier_order=5
            )
            model.add_seasonality(
                name='quarterly', 
                period=91.25, 
                fourier_order=8
            )
            
            # Add holiday effects for major retail periods
            model.add_country_holidays(country_name='US')
            
            # Fit the model
            model.fit(prophet_df)
            
            # Store the model
            model_key = f"{product_id}_{store_id}" if store_id else product_id
            self.models[model_key] = model
            
            # Perform cross-validation for performance metrics
            cv_results = cross_validation(
                model, 
                initial='90 days', 
                period='30 days', 
                horizon='30 days',
                disable_tqdm=True
            )
            
            # Calculate performance metrics
            perf_metrics = performance_metrics(cv_results)
            
            # Store performance metrics
            self.performance_metrics[model_key] = {
                'mae': perf_metrics['mae'].mean(),
                'mape': perf_metrics['mape'].mean(),
                'rmse': perf_metrics['rmse'].mean(),
                'mdape': perf_metrics['mdape'].mean(),
                'smape': perf_metrics['smape'].mean(),
                'coverage': perf_metrics['coverage'].mean()
            }
            
            results = {
                'product_id': product_id,
                'store_id': store_id,
                'training_samples': len(prophet_df),
                'date_range': {
                    'start': prophet_df['ds'].min().strftime('%Y-%m-%d'),
                    'end': prophet_df['ds'].max().strftime('%Y-%m-%d')
                },
                'performance_metrics': self.performance_metrics[model_key],
                'model_config': {
                    'seasonality_mode': self.seasonality_mode,
                    'confidence_level': self.confidence_level,
                    'changepoint_prior_scale': self.changepoint_prior_scale,
                    'seasonality_prior_scale': self.seasonality_prior_scale
                }
            }
            
            logger.info(f"Prophet model trained successfully for {model_key}. MAE: {results['performance_metrics']['mae']:.2f}")
            return results
            
        except Exception as e:
            logger.error(f"Error training Prophet model for product {product_id}: {str(e)}")
            raise
    
    def forecast(self, product_id: str, horizon_days: int, 
                 store_id: Optional[str] = None,
                 include_components: bool = True) -> Dict[str, Any]:
        """
        Generate probabilistic forecast with P50/P90 quantiles.
        
        Args:
            product_id: Product identifier
            horizon_days: Number of days to forecast
            store_id: Store identifier (optional)
            include_components: Whether to include trend/seasonality breakdown
            
        Returns:
            Forecast results with P50/P90 quantiles and confidence intervals
        """
        model_key = f"{product_id}_{store_id}" if store_id else product_id
        
        if model_key not in self.models:
            raise ValueError(f"No trained model found for {model_key}")
        
        try:
            model = self.models[model_key]
            
            # Generate future dates
            last_date = model.history['ds'].max()
            future_dates = pd.date_range(
                start=last_date + timedelta(days=1),
                periods=horizon_days,
                freq='D'
            )
            
            # Create future dataframe
            future_df = pd.DataFrame({'ds': future_dates})
            
            # Generate forecast
            forecast = model.predict(future_df)
            
            # Extract key components
            forecast_results = {
                'product_id': product_id,
                'store_id': store_id,
                'forecast_dates': future_dates.strftime('%Y-%m-%d').tolist(),
                'forecast_horizon_days': horizon_days,
                'confidence_level': self.confidence_level,
                'model_version': '2.0.0-prophet',
                'generated_at': datetime.now().isoformat()
            }
            
            # Extract quantiles and confidence intervals
            if 'yhat' in forecast.columns:
                forecast_results['p50_forecast'] = forecast['yhat'].tolist()
                forecast_results['p50_forecast_rounded'] = np.round(forecast['yhat']).astype(int).tolist()
            
            if 'yhat_lower' in forecast.columns:
                forecast_results['p05_forecast'] = forecast['yhat_lower'].tolist()
                forecast_results['p05_forecast_rounded'] = np.round(forecast['yhat_lower']).astype(int).tolist()
            
            if 'yhat_upper' in forecast.columns:
                forecast_results['p95_forecast'] = forecast['yhat_upper'].tolist()
                forecast_results['p95_forecast_rounded'] = np.round(forecast['yhat_upper']).astype(int).tolist()
            
            # Calculate P90 (90th percentile) for reorder point calculations
            if 'yhat' in forecast.columns and 'yhat_lower' in forecast.columns and 'yhat_upper' in forecast.columns:
                # P90 is approximately 1.28 standard deviations above P50
                # Using the confidence interval to estimate standard deviation
                std_estimate = (forecast['yhat_upper'] - forecast['yhat_lower']) / (2 * 1.96)  # 95% CI = ±1.96σ
                p90_forecast = forecast['yhat'] + (1.28 * std_estimate)
                forecast_results['p90_forecast'] = p90_forecast.tolist()
                forecast_results['p90_forecast_rounded'] = np.round(p90_forecast).astype(int).tolist()
            
            # Include trend and seasonality components if requested
            if include_components:
                if 'trend' in forecast.columns:
                    forecast_results['trend'] = forecast['trend'].tolist()
                if 'weekly' in forecast.columns:
                    forecast_results['weekly_seasonality'] = forecast['weekly'].tolist()
                if 'yearly' in forecast.columns:
                    forecast_results['yearly_seasonality'] = forecast['yearly'].tolist()
            
            # Add performance metrics if available
            if model_key in self.performance_metrics:
                forecast_results['model_performance'] = self.performance_metrics[model_key]
            
            logger.info(f"Prophet forecast generated for {model_key}, horizon: {horizon_days} days")
            return forecast_results
            
        except Exception as e:
            logger.error(f"Error generating forecast for {model_key}: {str(e)}")
            raise
    
    def get_model_performance(self, product_id: str, store_id: Optional[str] = None) -> Dict[str, Any]:
        """Get performance metrics for a trained model."""
        model_key = f"{product_id}_{store_id}" if store_id else product_id
        
        if model_key not in self.performance_metrics:
            raise ValueError(f"No performance metrics found for {model_key}")
        
        return self.performance_metrics[model_key]
    
    def update_model(self, product_id: str, new_sales_data: pd.DataFrame, 
                     store_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Update existing model with new data.
        
        Args:
            product_id: Product identifier
            new_sales_data: New sales data to add
            store_id: Store identifier (optional)
            
        Returns:
            Update results
        """
        model_key = f"{product_id}_{store_id}" if store_id else product_id
        
        if model_key not in self.models:
            raise ValueError(f"No existing model found for {model_key}")
        
        try:
            # Prepare new data
            new_prophet_df = self.prepare_data_for_prophet(new_sales_data)
            
            # Get existing model
            model = self.models[model_key]
            
            # Add new data and refit
            model.history = pd.concat([model.history, new_prophet_df]).drop_duplicates(subset=['ds'])
            model.fit(model.history)
            
            # Update performance metrics
            cv_results = cross_validation(
                model, 
                initial='90 days', 
                period='30 days', 
                horizon='30 days',
                disable_tqdm=True
            )
            
            perf_metrics = performance_metrics(cv_results)
            self.performance_metrics[model_key] = {
                'mae': perf_metrics['mae'].mean(),
                'mape': perf_metrics['mape'].mean(),
                'rmse': perf_metrics['rmse'].mean(),
                'mdape': perf_metrics['mdape'].mean(),
                'smape': perf_metrics['smape'].mean(),
                'coverage': perf_metrics['coverage'].mean()
            }
            
            results = {
                'product_id': product_id,
                'store_id': store_id,
                'update_samples': len(new_prophet_df),
                'total_samples': len(model.history),
                'updated_at': datetime.now().isoformat(),
                'performance_metrics': self.performance_metrics[model_key]
            }
            
            logger.info(f"Model updated successfully for {model_key}")
            return results
            
        except Exception as e:
            logger.error(f"Error updating model for {model_key}: {str(e)}")
            raise


class EnsembleForecaster:
    """
    Ensemble forecaster combining multiple models for improved accuracy.
    """
    
    def __init__(self):
        self.prophet_forecaster = ProphetForecaster()
        self.models = {}
    
    def train_ensemble(self, sales_data: pd.DataFrame, product_id: str, 
                       store_id: Optional[str] = None) -> Dict[str, Any]:
        """Train ensemble of forecasting models."""
        results = {}
        
        # Train Prophet model
        try:
            prophet_results = self.prophet_forecaster.train(sales_data, product_id, store_id)
            results['prophet'] = prophet_results
        except Exception as e:
            logger.warning(f"Prophet training failed: {e}")
            results['prophet'] = {'error': str(e)}
        
        return results
    
    def forecast_ensemble(self, product_id: str, horizon_days: int, 
                         store_id: Optional[str] = None) -> Dict[str, Any]:
        """Generate ensemble forecast."""
        model_key = f"{product_id}_{store_id}" if store_id else product_id
        
        if model_key not in self.prophet_forecaster.models:
            raise ValueError(f"No trained models found for {model_key}")
        
        # Get Prophet forecast
        prophet_forecast = self.prophet_forecaster.forecast(
            product_id, horizon_days, store_id
        )
        
        return {
            'ensemble_forecast': prophet_forecast,
            'primary_model': 'prophet',
            'ensemble_method': 'single_model'  # Will expand to include more models
        }
