import React, { useState, useEffect } from 'react';
import { DartBoardSegment, BullseyeState } from '../../types/DartBoard';
import { puzzleToUrlParams } from '../../utils/urlUtils';
import styles from './ShareButton.module.css';

interface ShareButtonProps {
  segments: DartBoardSegment[];
  bullseye: BullseyeState;
}

const ShareButton: React.FC<ShareButtonProps> = ({ segments, bullseye }) => {
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Generate shareable URL whenever puzzle state changes
  useEffect(() => {
    const baseUrl = window.location.href.split('?')[0];
    const params = puzzleToUrlParams(segments, bullseye);
    setShareUrl(params ? `${baseUrl}?${params}` : '');
  }, [segments, bullseye]);

  // Reset notification after 3 seconds
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (showCopiedNotification) {
      timer = setTimeout(() => {
        setShowCopiedNotification(false);
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showCopiedNotification]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedNotification(true);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className={styles.shareContainer}>
      <button 
        className={styles.shareButton}
        onClick={handleCopyToClipboard}
        aria-label="Share puzzle"
        title="Copy shareable link to clipboard"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        Share Puzzle
      </button>
      
      <div className={`${styles.notification} ${showCopiedNotification ? styles.visible : ''}`}>
        Link copied to clipboard!
      </div>
      
      {shareUrl && (
        <div className={styles.linkContainer}>
          <div className={styles.linkText} title={shareUrl}>
            {shareUrl}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
