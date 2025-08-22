import Layout from "./Layout.jsx";

import Feed from "./Feed";

import Capture from "./Capture";

import Profile from "./Profile";

import Discover from "./Discover";

import Activity from "./Activity";

import Settings from "./Settings";

import Circles from "./Circles";

import You from "./You";

import Onboarding from "./Onboarding";

import TrustCircle from "./TrustCircle";

import CircleDetail from "./CircleDetail";

import CreateCircle from "./CreateCircle";

import EditMoment from "./EditMoment";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Feed: Feed,
    
    Capture: Capture,
    
    Profile: Profile,
    
    Discover: Discover,
    
    Activity: Activity,
    
    Settings: Settings,
    
    Circles: Circles,
    
    You: You,
    
    Onboarding: Onboarding,
    
    TrustCircle: TrustCircle,
    
    CircleDetail: CircleDetail,
    
    CreateCircle: CreateCircle,
    
    EditMoment: EditMoment,
    
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
                
                    <Route path="/" element={<Feed />} />
                
                
                <Route path="/Feed" element={<Feed />} />
                
                <Route path="/Capture" element={<Capture />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Discover" element={<Discover />} />
                
                <Route path="/Activity" element={<Activity />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Circles" element={<Circles />} />
                
                <Route path="/You" element={<You />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/TrustCircle" element={<TrustCircle />} />
                
                <Route path="/CircleDetail" element={<CircleDetail />} />
                
                <Route path="/CreateCircle" element={<CreateCircle />} />
                
                <Route path="/EditMoment" element={<EditMoment />} />
                
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