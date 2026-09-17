import React, { useState } from 'react';
import { User } from 'lucide-react';
import { initialsFrom } from '../lib/constants';

/**
 * Avatar com fallback genérico (iniciais ou ícone) quando não há foto.
 */
export default function Avatar({
  src,
  name = '',
  size = 28,
  radius = '50%',
  fontSize,
  style = {},
  className,
}) {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(src) && !failed;
  const initials = initialsFrom(name);
  const textSize = fontSize || Math.max(10, Math.round(size * 0.38));

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: '#E2E8F0',
        color: '#475569',
        fontWeight: 600,
        fontSize: textSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        border: '1px solid #E2E8F0',
        ...style,
      }}
      aria-hidden={!name}
      title={name || undefined}
    >
      {showImg ? (
        <img
          src={src}
          alt=""
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : initials && initials !== '?' ? (
        initials
      ) : (
        <User size={Math.round(size * 0.55)} strokeWidth={2} color="#64748B" />
      )}
    </div>
  );
}
