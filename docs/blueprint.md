# **App Name**: Guardian AI

## Core Features:

- Transaction Ingestion API: Simulated API endpoint to receive real-time financial transaction data, including user ID, amount, location, device, and timestamp.
- Behavioral Profile Management: Establishes and continuously updates normal user behavior patterns based on transaction history. Stores and retrieves user profiles.
- Feature Engineering Module: Transforms raw transaction data into machine-readable features (e.g., amount_ratio, unusual_time, location_change, new_device) for fraud analysis.
- AI Fraud Detection Engine: Compares new transactions against established user behavior profiles, calculates deviations, and assigns a weighted fraud risk score (0-100).
- AI Explainability Tool: Provides clear, concise reasons why a transaction was flagged as suspicious, such as 'Amount significantly higher than average' or 'New device detected'.
- Real-time Dashboard & Alerts: Displays a live feed of transactions, risk levels with color coding, pop-up fraud alerts, and detailed risk breakdown charts for administrators.
- Multi-Level Risk Classification: Categorizes transactions into 'Low Risk', 'Medium Risk', and 'High Risk' to prioritize administrator review.

## Style Guidelines:

- Color scheme: Dark. Conveys seriousness, tech sophistication, and allows alert highlights to stand out clearly.
- Primary color: Deep, vibrant purplish-blue (#4F2AF7). Represents digital security, trust, and advanced technology. (HSL: 240, 70%, 55%)
- Background color: Very dark, desaturated purple-gray (#1C1B25). Provides a subtle depth and contrasts well with primary and text. (HSL: 240, 15%, 12%)
- Accent color: Bright, clear blue (#6BBFFF). Used for interactive elements, highlights, and critical information. (HSL: 210, 60%, 70%)
- All text: 'Inter' sans-serif. Chosen for its clean, modern, and highly legible appearance, ideal for displaying data and technical information clearly on a dashboard.
- Utilize sleek, minimalist line icons. Icons should represent security concepts (e.g., lock, shield) and data visualization (e.g., charts, arrows).
- Dashboard layout: Modular, with clear separation of data feeds, alert areas, and analytical charts. Prioritize readability of real-time data with efficient information hierarchy.
- Subtle, rapid animations for real-time data updates and alert notifications. Focus on smooth transitions and visual feedback without distraction.