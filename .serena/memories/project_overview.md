# LOTCFORM Project Overview

## Project Purpose
LOTC Form (Least of These Carolinas Request Form) is a web-based form submission system for handling requests from Least of These Carolinas. The application captures caregiver, social worker, and child information through a comprehensive form interface and submits data to both local JSON storage and Neon CRM.

## Project Type
Full-stack web application with serverless deployment capabilities

## Key Features
- Full-featured HTML form with client-side validation
- Serverless backend deployed on Vercel
- Dual storage: Local JSON files + Neon CRM integration
- Conditional form fields with auto-population (ZIP code lookup, age calculation)
- Mobile-friendly responsive design
- CORS-enabled API for cross-origin requests
- Graceful degradation when Neon CRM is unavailable

## Deployment Targets
- **Local Development**: Node.js/Express server on port 3000
- **Production**: Vercel serverless functions

## Primary Users
- Social workers submitting requests for children in care
- Caregivers requesting services from LOTC
- LOTC staff managing submission data in Neon CRM
