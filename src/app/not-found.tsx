import SiteNotFound from './(site)/not-found';
import SiteLayout from './(site)/layout';

/*
 * Unmatched URLs (e.g. a mistyped link) render here, outside the (site) route group — so wrap the branded
 * not-found page in the site layout instead of showing Next's plain default 404.
 */
export default function RootNotFound() {
  return (
    <SiteLayout params={Promise.resolve({})}>
      <SiteNotFound />
    </SiteLayout>
  );
}
