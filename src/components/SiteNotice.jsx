import siteConfig from '../data/siteConfig.js';

// Landing-page banner for a single important update (from the main site's
// Announcement.jsx). Named SiteNotice because `.announcement` is already
// taken by the portal's announcement feed.
export default function SiteNotice() {
  const { notice } = siteConfig.event.hero;
  if (!notice) return null;

  return (
    <div className="site-notice" role="status">
      <div className="site-notice__inner">
        <span className="site-notice__tag">UPDATE</span>
        <span className="site-notice__text">{notice}</span>
      </div>
    </div>
  );
}
