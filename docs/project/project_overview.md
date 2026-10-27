# MedPredict AI - Intelligent Hospital Medicine Inventory Optimization System

## Project Overview
MedPredict AI is an end-to-end full-stack clinical supply chain and machine learning platform designed to prevent medicine stockouts, reduce drug expiration waste, enforce First-Expired-First-Out (FEFO) dispensing protocols, and deliver actionable explainable AI recommendations for hospital administrators and pharmacists.

## Core System Layers
1. **React Frontend**: Modern single-page application built with TypeScript, Vite, Tailwind CSS, Lucide icons, and Recharts. Features role-based dashboard views for Admin, Pharmacy Manager, and Pharmacist.
2. **FastAPI Backend**: High-performance asynchronous REST API supporting JWT authentication, bcrypt password security, role-based authorization, and FEFO inventory transaction processing.
3. **PostgreSQL Relational DB**: ACID-compliant storage for hospitals, users, medicines, batches, suppliers, purchases, dispensations, and prediction audits.
4. **Machine Learning & SHAP**:
   - Shortage Risk Classification & Demand Velocity Analysis
   - Expiry Risk Estimator & Unsold Unit Quantification
   - SHAP Feature Explanations
   - Transparent Rule-Based Procurement Recommendations
