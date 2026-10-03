import siteConfig from '../data/siteConfig.js';

const tracksWithResources = siteConfig.event.tracks.filter((track) => track.resources?.length);

// Datasets and workshop recordings, grouped by track. The links live on each
// track in siteConfig.js so they stay next to the rest of that track's copy.
export default function ResourcesPage() {
  return (
    <section>
      <div className="portal-shell__intro">
        <p className="eyebrow">RESOURCES</p>
        <h1 className="section__heading">Datasets and workshop recordings.</h1>
        <p className="section__lede">
          Everything sponsors have shared for their tracks. Track details and prizes are on the
          Tracks tab.
        </p>
      </div>

      {tracksWithResources.map((track) => (
        <div className="team-card" key={track.slug}>
          <p className="team-card__title">{track.name}</p>
          <ul className="tracks-page__list resources-page__list">
            {track.resources.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noreferrer">{r.label}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
