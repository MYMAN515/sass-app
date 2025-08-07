// components/Spinner.jsx
'use client';

export default function Spinner({ size = 24, color = 'border-white' }) {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`w-${size} h-${size} border-4 border-t-transparent ${color} rounded-full animate-spin`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      />
    </div>
  );
}
