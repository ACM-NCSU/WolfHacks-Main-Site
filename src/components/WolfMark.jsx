export default function WolfMark({ className = '' }) {
  return (
    <svg
      className={`wolf-mark ${className}`}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <polygon className="wolf-mark__ear" points="18,75 60,108 57,42" />
      <polygon className="wolf-mark__ear" points="182,75 140,108 143,42" />
      <polygon className="wolf-mark__ear-facet wolf-mark__ear-facet--dark" points="57,42 18,75 39,92" />
      <polygon className="wolf-mark__ear-facet wolf-mark__ear-facet--light" points="57,42 39,92 60,108" />
      <polygon className="wolf-mark__ear-facet wolf-mark__ear-facet--dark" points="143,42 182,75 161,92" />
      <polygon className="wolf-mark__ear-facet wolf-mark__ear-facet--light" points="143,42 161,92 140,108" />
      <polygon className="wolf-mark__ear-inner" points="30,72 52,93 50,54" />
      <polygon className="wolf-mark__ear-inner" points="170,72 148,93 150,54" />

      <polygon className="wolf-mark__face" points="56,82 100,56 144,82 128,146 100,197 72,146" />

      <polygon className="wolf-mark__facet wolf-mark__facet--light" points="100,110 100,56 144,82" />
      <polygon className="wolf-mark__facet wolf-mark__facet--light" points="100,110 144,82 128,146" />
      <polygon className="wolf-mark__facet wolf-mark__facet--mid" points="100,110 128,146 100,197" />
      <polygon className="wolf-mark__facet wolf-mark__facet--dark" points="100,110 100,197 72,146" />
      <polygon className="wolf-mark__facet wolf-mark__facet--dark" points="100,110 72,146 56,82" />
      <polygon className="wolf-mark__facet wolf-mark__facet--mid" points="100,110 56,82 100,56" />

      <polygon className="wolf-mark__fur" points="60,98 46,105 59,113" />
      <polygon className="wolf-mark__fur" points="65,122 51,129 64,137" />
      <polygon className="wolf-mark__fur" points="140,98 154,105 141,113" />
      <polygon className="wolf-mark__fur" points="135,122 149,129 136,137" />

      <path className="wolf-mark__stripe" d="M100,64 L100,174" />
      <path className="wolf-mark__brow" d="M68,101 L90,108" />
      <path className="wolf-mark__brow" d="M132,101 L110,108" />

      <polygon className="wolf-mark__nose" points="93,179 107,179 100,193" />

      <circle className="wolf-mark__eye-glow" cx="82" cy="113" r="11" />
      <circle className="wolf-mark__eye-glow" cx="118" cy="113" r="11" />
      <circle className="wolf-mark__eye" cx="82" cy="113" r="5.5" />
      <circle className="wolf-mark__eye" cx="118" cy="113" r="5.5" />
    </svg>
  );
}
