import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const AnalyticsTracker = () => {
    const location = useLocation();

    useEffect(() => {
        if (typeof window.gtag === 'function') {
            window.gtag("config", "G-95YDJPPSS4", {
                page_path: location.pathname + location.search,
            });
        }
    }, [location]);

    return null;
};

export default AnalyticsTracker;
