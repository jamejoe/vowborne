
import React from 'react';

const SVGWrapper: React.FC<{ children: React.ReactNode, className?: string, viewBox?: string }> = ({ children, className, viewBox = "0 0 24 24" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${className}`} viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const IconUsers = ({ className }: { className?: string }) => (
  <SVGWrapper className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <path d="M20 17v-2a4 4 0 0 0-4-4h-1"></path>
    <circle cx="17.5" cy="7" r="4"></circle>
  </SVGWrapper>
);

export const IconScroll = ({ className }: { className?: string }) => (
  <SVGWrapper className={className} viewBox="0 0 24 24" >
    <path d="M8 21h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8" />
    <path d="M6 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
    <path d="M6 21V3" />
  </SVGWrapper>
);

export const IconBountyBoard = ({ className }: { className?: string }) => (
    <SVGWrapper className={className} viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <circle cx="12" cy="15" r="3"></circle>
        <line x1="12" y1="9" x2="12" y2="12"></line>
        <line x1="12" y1="18" x2="12" y2="21"></line>
        <line x1="9" y1="15" x2="6" y2="15"></line>
        <line x1="18" y1="15" x2="15" y2="15"></line>
    </SVGWrapper>
);

export const IconRecruitment = ({ className }: { className?: string }) => (
    <SVGWrapper className={className} viewBox="0 0 24 24">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="8.5" cy="7" r="4"></circle>
        <line x1="20" y1="8" x2="20" y2="14"></line>
        <line x1="17" y1="11" x2="23" y2="11"></line>
    </SVGWrapper>
);

export const IconTraining = ({ className }: { className?: string }) => (
    <SVGWrapper className={className} viewBox="0 0 24 24">
        <path d="M18 8L22 12L18 16" />
        <path d="M6 8L2 12L6 16" />
        <path d="M15 5L9 19" />
    </SVGWrapper>
);

export const IconArmory = ({ className }: { className?: string }) => (
    <SVGWrapper className={className} viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"></path>
        <path d="M22 2L2 22"></path>
    </SVGWrapper>
);

export const IconDispatch = ({ className }: { className?: string }) => (
    <SVGWrapper className={className} viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </SVGWrapper>
);

export const IconReport = ({ className }: { className?: string }) => (
    <SVGWrapper className={className} viewBox="0 0 24 24">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </SVGWrapper>
);

export const IconResearch = ({ className }: { className?: string }) => (
    <SVGWrapper className={className} viewBox="0 0 24 24">
        <path d="M21.21 15.89A10 10 0 1 1 8.11 2.79" />
        <path d="m2 12 4 4 4-4" />
        <path d="M12 2v10" />
    </SVGWrapper>
);

export const IconLock = ({ className }: { className?: string }) => (
  <SVGWrapper className={className} viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </SVGWrapper>
);

export const IconCheckCircle = ({ className }: { className?: string }) => (
  <SVGWrapper className={className} viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </SVGWrapper>
);

export const IconBarracks = ({ className }: { className?: string }) => (
  <SVGWrapper className={className} viewBox="0 0 24 24">
    <path d="M4 22V8.5C4 6 6 4 8.5 4S13 6 13 8.5V22"></path>
    <path d="M13 14L20 14L20 18L13 18"></path>
    <line x1="13" y1="4" x2="13" y2="22"></line>
  </SVGWrapper>
);

export const IconSettings = ({ className }: { className?: string }) => (
    <SVGWrapper className={className} viewBox="0 0 24 24">
      <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.44,0.17-0.48,0.41L9.2,5.7c-0.59,0.24-1.13,0.57-1.62,0.94l-2.39-0.96c-0.22-0.08-0.47,0-0.59,0.22L2.69,9.22 c-0.11,0.2-0.06,0.47,0.12,0.61l2.03,1.58c-0.05,0.3-0.07,0.62-0.07,0.94s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39,0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.04,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44,0.17,0.48,0.41l0.36-2.54c0.59-0.24,1.13,0.57,1.62,0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59,0.22l1.92-3.32c0.12-0.2,0.07-0.47-0.12-0.61L19.14,12.94z" />
      <circle cx="12" cy="12" r="3.5" />
    </SVGWrapper>
);

export const IconExp = ({ className }: { className?: string }) => (
    <SVGWrapper className={className}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </SVGWrapper>
);

export const IconGold = ({ className }: { className?: string }) => (
    <SVGWrapper className={className}>
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </SVGWrapper>
);

export const IconTreasureChest = ({ className }: { className?: string }) => (
    <SVGWrapper className={className}>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M2 7h20v3H2z"></path>
        <path d="M12 12v4"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        <path d="M8 3.13a4 4 0 0 0 0 7.75"></path>
    </SVGWrapper>
);
