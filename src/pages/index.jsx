import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Onboarding from "./Onboarding";

import Recipes from "./Recipes";

import WeeklyPlanner from "./WeeklyPlanner";

import Notifications from "./Notifications";

import ShoppingList from "./ShoppingList";

import Profile from "./Profile";

import Favorites from "./Favorites";

import Privacy from "./Privacy";

import Terms from "./Terms";

import FAQ from "./FAQ";

import Settings from "./Settings";

import MealHistory from "./MealHistory";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Onboarding: Onboarding,
    
    Recipes: Recipes,
    
    WeeklyPlanner: WeeklyPlanner,
    
    Notifications: Notifications,
    
    ShoppingList: ShoppingList,
    
    Profile: Profile,
    
    Favorites: Favorites,
    
    Privacy: Privacy,
    
    Terms: Terms,
    
    FAQ: FAQ,
    
    Settings: Settings,
    
    MealHistory: MealHistory,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/Recipes" element={<Recipes />} />
                
                <Route path="/WeeklyPlanner" element={<WeeklyPlanner />} />
                
                <Route path="/Notifications" element={<Notifications />} />
                
                <Route path="/ShoppingList" element={<ShoppingList />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Favorites" element={<Favorites />} />
                
                <Route path="/Privacy" element={<Privacy />} />
                
                <Route path="/Terms" element={<Terms />} />
                
                <Route path="/FAQ" element={<FAQ />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/MealHistory" element={<MealHistory />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}