"""
Reorder point calculation engine using P90 forecasts and lead time distributions.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class ReorderPointConfig:
    """Configuration for reorder point calculations."""
    service_level: float = 0.95  # 95% service level
    safety_stock_multiplier: float = 1.28  # Z-score for 90th percentile
    min_order_quantity: int = 1
    case_pack_size: int = 1
    min_order_value: float = 0.0
    lead_time_days: int = 7
    lead_time_std_days: float = 2.0
    review_period_days: int = 1
    budget_cap: Optional[float] = None


@dataclass
class ReorderRecommendation:
    """Reorder recommendation with detailed breakdown."""
    product_id: str
    store_id: str
    current_inventory: int
    reorder_point: int
    reorder_quantity: int
    safety_stock: int
    demand_during_lt: int
    lead_time_days: int
    service_level: float
    total_cost: float
    urgency: str  # 'critical', 'high', 'medium', 'low'
    recommendation_date: datetime
    reasoning: str


class ReorderPointEngine:
    """
    Engine for calculating optimal reorder points using P90 forecasts.
    """
    
    def __init__(self, config: Optional[ReorderPointConfig] = None):
        self.config = config or ReorderPointConfig()
        
    def calculate_demand_during_lead_time(self, 
                                        daily_forecasts: List[float],
                                        lead_time_days: int,
                                        confidence_level: float = 0.90) -> Dict[str, float]:
        """
        Calculate demand during lead time using P90 forecasts.
        
        Args:
            daily_forecasts: List of daily forecasted demands
            lead_time_days: Expected lead time in days
            confidence_level: Confidence level for demand during LT
            
        Returns:
            Dictionary with P50 and P90 demand during lead time
        """
        if len(daily_forecasts) < lead_time_days:
            raise ValueError(f"Insufficient forecast data. Need at least {lead_time_days} days.")
        
        # Take the first lead_time_days forecasts
        lt_forecasts = daily_forecasts[:lead_time_days]
        
        # Calculate P50 (mean) and P90 demand during lead time
        p50_demand = np.mean(lt_forecasts)
        p90_demand = np.percentile(lt_forecasts, 90)
        
        # Calculate standard deviation for safety stock
        std_demand = np.std(lt_forecasts)
        
        return {
            'p50_demand': p50_demand,
            'p90_demand': p90_demand,
            'std_demand': std_demand,
            'total_demand': sum(lt_forecasts)
        }
    
    def calculate_safety_stock(self, 
                              std_demand: float,
                              lead_time_std: float,
                              service_level: float) -> float:
        """
        Calculate safety stock using demand and lead time variability.
        
        Args:
            std_demand: Standard deviation of daily demand
            lead_time_std: Standard deviation of lead time
            service_level: Desired service level (e.g., 0.95 for 95%)
            
        Returns:
            Safety stock quantity
        """
        # Z-score for service level
        z_scores = {0.90: 1.28, 0.95: 1.645, 0.99: 2.326}
        z_score = z_scores.get(service_level, 1.645)
        
        # Safety stock formula: Z * sqrt(lead_time * std_demand^2 + demand^2 * std_lead_time^2)
        safety_stock = z_score * np.sqrt(
            self.config.lead_time_days * std_demand**2 + 
            (self.config.demand_during_lt or 0)**2 * lead_time_std**2
        )
        
        return max(0, safety_stock)
    
    def calculate_reorder_point(self, 
                              demand_during_lt: float,
                              safety_stock: float,
                              review_period_days: int = 1) -> int:
        """
        Calculate reorder point.
        
        Args:
            demand_during_lt: Expected demand during lead time
            safety_stock: Safety stock quantity
            review_period_days: Review period in days
            
        Returns:
            Reorder point quantity
        """
        # Reorder point = demand during lead time + safety stock + review period demand
        review_demand = demand_during_lt * (review_period_days / self.config.lead_time_days)
        reorder_point = demand_during_lt + safety_stock + review_demand
        
        return max(0, int(np.ceil(reorder_point)))
    
    def calculate_reorder_quantity(self, 
                                 reorder_point: int,
                                 current_inventory: int,
                                 min_order_qty: int,
                                 case_pack_size: int) -> int:
        """
        Calculate optimal reorder quantity.
        
        Args:
            reorder_point: Calculated reorder point
            current_inventory: Current inventory level
            min_order_qty: Minimum order quantity
            case_pack_size: Case pack size for ordering
            
        Returns:
            Recommended reorder quantity
        """
        if current_inventory >= reorder_point:
            return 0  # No reorder needed
        
        # Calculate how much we need to order
        needed_quantity = reorder_point - current_inventory
        
        # Round up to case pack size
        if case_pack_size > 1:
            reorder_qty = int(np.ceil(needed_quantity / case_pack_size) * case_pack_size)
        else:
            reorder_qty = needed_quantity
        
        # Ensure minimum order quantity
        reorder_qty = max(reorder_qty, min_order_qty)
        
        return reorder_qty
    
    def determine_urgency(self, 
                         current_inventory: int,
                         reorder_point: int,
                         safety_stock: int) -> str:
        """
        Determine urgency level of reorder.
        
        Args:
            current_inventory: Current inventory level
            reorder_point: Calculated reorder point
            safety_stock: Safety stock level
            
        Returns:
            Urgency level: 'critical', 'high', 'medium', 'low'
        """
        if current_inventory <= safety_stock:
            return 'critical'
        elif current_inventory <= reorder_point * 0.5:
            return 'high'
        elif current_inventory <= reorder_point:
            return 'medium'
        else:
            return 'low'
    
    def generate_reorder_recommendation(self,
                                      product_id: str,
                                      store_id: str,
                                      current_inventory: int,
                                      daily_forecasts: List[float],
                                      unit_cost: float,
                                      config: Optional[ReorderPointConfig] = None) -> ReorderRecommendation:
        """
        Generate complete reorder recommendation.
        
        Args:
            product_id: Product identifier
            store_id: Store identifier
            current_inventory: Current inventory level
            daily_forecasts: List of daily forecasted demands
            unit_cost: Unit cost of the product
            config: Optional configuration override
            
        Returns:
            Complete reorder recommendation
        """
        # Use provided config or default
        local_config = config or self.config
        
        try:
            # Calculate demand during lead time
            lt_demand = self.calculate_demand_during_lead_time(
                daily_forecasts, 
                local_config.lead_time_days
            )
            
            # Calculate safety stock
            safety_stock = self.calculate_safety_stock(
                lt_demand['std_demand'],
                local_config.lead_time_std_days,
                local_config.service_level
            )
            
            # Calculate reorder point
            reorder_point = self.calculate_reorder_point(
                lt_demand['p90_demand'],  # Use P90 for conservative approach
                safety_stock,
                local_config.review_period_days
            )
            
            # Calculate reorder quantity
            reorder_qty = self.calculate_reorder_quantity(
                reorder_point,
                current_inventory,
                local_config.min_order_quantity,
                local_config.case_pack_size
            )
            
            # Determine urgency
            urgency = self.determine_urgency(current_inventory, reorder_point, safety_stock)
            
            # Calculate total cost
            total_cost = reorder_qty * unit_cost
            
            # Check budget constraints
            if local_config.budget_cap and total_cost > local_config.budget_cap:
                # Adjust reorder quantity to fit budget
                max_qty = int(local_config.budget_cap / unit_cost)
                reorder_qty = min(reorder_qty, max_qty)
                total_cost = reorder_qty * unit_cost
                urgency = 'high'  # Budget constraint increases urgency
            
            # Generate reasoning
            reasoning = self._generate_reasoning(
                current_inventory, reorder_point, safety_stock, 
                reorder_qty, lt_demand, urgency
            )
            
            return ReorderRecommendation(
                product_id=product_id,
                store_id=store_id,
                current_inventory=current_inventory,
                reorder_point=reorder_point,
                reorder_quantity=reorder_qty,
                safety_stock=int(safety_stock),
                demand_during_lt=int(lt_demand['p90_demand']),
                lead_time_days=local_config.lead_time_days,
                service_level=local_config.service_level,
                total_cost=total_cost,
                urgency=urgency,
                recommendation_date=datetime.now(),
                reasoning=reasoning
            )
            
        except Exception as e:
            logger.error(f"Error generating reorder recommendation for {product_id}: {str(e)}")
            raise
    
    def _generate_reasoning(self, 
                           current_inventory: int,
                           reorder_point: int,
                           safety_stock: int,
                           reorder_qty: int,
                           lt_demand: Dict[str, float],
                           urgency: str) -> str:
        """Generate human-readable reasoning for the recommendation."""
        reasoning_parts = []
        
        if current_inventory <= safety_stock:
            reasoning_parts.append("Critical: Inventory below safety stock level")
        elif current_inventory <= reorder_point:
            reasoning_parts.append(f"Reorder needed: Current inventory ({current_inventory}) below reorder point ({reorder_point})")
        
        reasoning_parts.append(f"P90 demand during {self.config.lead_time_days}-day lead time: {lt_demand['p90_demand']:.1f}")
        reasoning_parts.append(f"Safety stock: {safety_stock:.1f}")
        
        if reorder_qty > 0:
            reasoning_parts.append(f"Recommended order: {reorder_qty} units")
            if urgency == 'critical':
                reasoning_parts.append("URGENT: Order immediately to prevent stockout")
            elif urgency == 'high':
                reasoning_parts.append("Order soon to maintain service levels")
        else:
            reasoning_parts.append("No reorder needed at this time")
        
        return ". ".join(reasoning_parts)
    
    def batch_reorder_recommendations(self,
                                    inventory_data: List[Dict[str, Any]],
                                    forecast_data: Dict[str, List[float]],
                                    configs: Optional[Dict[str, ReorderPointConfig]] = None) -> List[ReorderRecommendation]:
        """
        Generate reorder recommendations for multiple products.
        
        Args:
            inventory_data: List of inventory records
            forecast_data: Dictionary mapping product_id to daily forecasts
            configs: Optional product-specific configurations
            
        Returns:
            List of reorder recommendations
        """
        recommendations = []
        
        for item in inventory_data:
            product_id = item['product_id']
            store_id = item.get('store_id', 'default')
            
            if product_id not in forecast_data:
                logger.warning(f"No forecast data for product {product_id}")
                continue
            
            # Get product-specific config or use default
            config = configs.get(product_id) if configs else None
            
            try:
                recommendation = self.generate_reorder_recommendation(
                    product_id=product_id,
                    store_id=store_id,
                    current_inventory=item['current_inventory'],
                    daily_forecasts=forecast_data[product_id],
                    unit_cost=item.get('unit_cost', 0.0),
                    config=config
                )
                recommendations.append(recommendation)
                
            except Exception as e:
                logger.error(f"Failed to generate recommendation for {product_id}: {str(e)}")
                continue
        
        # Sort by urgency (critical first)
        urgency_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
        recommendations.sort(key=lambda x: urgency_order.get(x.urgency, 4))
        
        return recommendations
