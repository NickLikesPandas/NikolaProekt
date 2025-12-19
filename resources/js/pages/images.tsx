import React from 'react';
import Images from '@/components/Image'; // Renamed the import to better reflect its purpose

const ImagesPage: React.FC = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Image Gallery</h1>
            <Images /> {/* Updated the component name to match the import */}
        </div>
    );
};

export default ImagesPage;