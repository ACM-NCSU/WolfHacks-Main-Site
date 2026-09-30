import siteConfig from '../data/siteConfig.js';

export default function Announcement() {
  const { notice } = siteConfig.event.hero;
  if (!notice) return null;

  return (
    <div className="announcement" role="status">
      <div className="announcement__inner">
        <span className="announcement__tag">UPDATE</span>
        <span className="announcement__text">{notice}</span>
      </div>
    </div>
  );
}
