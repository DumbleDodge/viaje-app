import React, { useState, useEffect } from 'react';
import { Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import { get } from 'idb-keyval';

const SmartAttachmentChip = ({ attachment, onOpen, refreshTrigger }) => {
  const [isOffline, setIsOffline] = useState(false);
  useEffect(() => {
    const checkCache = async () => {
      if (attachment.path) {
        const file = await get(attachment.path);
        setIsOffline(!!file);
      }
    };
    checkCache();
  }, [attachment, refreshTrigger]);

  return (
    <Chip
      label={attachment.name}
      onClick={(e) => { e.stopPropagation(); onOpen(attachment); }}
      icon={isOffline ? <CheckCircleOutlineIcon style={{ fontSize: 16, color: '#1B5E20' }} /> : <CloudQueueIcon style={{ fontSize: 16 }} />}
      sx={{
        height: '24px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
        bgcolor: isOffline ? '#E8F5E9' : 'action.selected',
        border: isOffline ? '1px solid #A5D6A7' : '1px solid rgba(0,0,0,0.1)',
        color: isOffline ? '#1B5E20' : 'text.primary', maxWidth: '100%'
      }}
    />
  );
};
export default SmartAttachmentChip;