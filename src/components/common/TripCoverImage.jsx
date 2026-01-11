import React from 'react';
import { CardMedia } from '@mui/material';

const TripCoverImage = ({ url, place, height }) => {
  const imageSrc =
    url && url.length > 5
      ? url
      : `https://loremflickr.com/800/400/${encodeURIComponent(
        place
      )},landscape/all`;
  return (
    <CardMedia
      component="img"
      height={height}
      image={imageSrc}
      sx={{
        filter: "brightness(0.95)",
        objectFit: "cover",
        height: height,
        width: "100%",
      }}
      onError={(e) => {
        e.target.src = `https://loremflickr.com/800/400/${encodeURIComponent(
          place
        )},landscape/all`;
      }}
    />
  );
};

export default TripCoverImage;