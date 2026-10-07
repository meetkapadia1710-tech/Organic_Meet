import { useRouteError } from 'react-router';

export function RouteError() {
  const error = useRouteError();
  console.error('Portfolio route failed', error);
  return (
    <main id="main" style={{ maxWidth: 720, margin: '15vh auto', padding: 24 }}>
      <h1>This page could not load.</h1>
      <p>Please reload the page to try again.</p>
      <button className="btn btn-primary" type="button" onClick={() => window.location.reload()}>Reload page</button>
      <p><a href={import.meta.env.BASE_URL}>Back to home</a></p>
    </main>
  );
}
