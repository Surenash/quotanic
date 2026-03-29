# Changelog History Log

**Current Updates:**
- **Manufacturer Profile Management**: Resolved blank screen crashes and fixed company name persistence by updating `ManufacturerProfileSerializer` and implementing full data normalization in `index.tsx`.
- **Authentication & Persistence**: Implemented History API-based routing and session persistence in the root `App` component, fixing the "logout on refresh" issue and adding an initialization loading state.
- **3D Viewer Integration**: Developed a modular 3D viewer with support for STL, OBJ, and STEP/IGES formats. Automated backend GLB/STL fallback generation using `pythonocc-core` and resolved CORS issues via Nginx.
- **Live Currency Conversion**: Integrated the Frankfurter API and implemented a global `CurrencyProvider` with a header selector supporting USD, EUR, GBP, INR, JPY, CAD, and AUD.
- **Essential Pages**: Fully developed the About Us, FAQ, Contact Us, Detailed How It Works, Privacy Policy, and Terms of Service pages, replacing all placeholders.
- **UI/UX & Motion**: Added entrance animations, hover-lift micro-interactions, and focus-glow effects. Replaced false advertising statistics with realistic data and a creator testimonial.
- **Deployment Optimization**: Optimized the AWS Amplify build pipeline by switching to Node 20, increasing build memory, and streamlining dependency installation.
- **Performance**: Improved backend response times by pre-fetching related user data using `select_related('user')`.

**Previous Updates:**
- Generated the comprehensive `context/` directory to document architecture, instructions, goals, and technical details of the Quotanic platform.
- *(Note: Initial generation of this log. Future significant changes to the codebase should be documented here with dates and impacts.)*
