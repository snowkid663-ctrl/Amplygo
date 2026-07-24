/** Login/onboarding background: a subtle drifting grid, a slow rotating beam
 *  of light, and a soft central spotlight. Distinct from the landing aurora. */
export default function AuthBackground() {
  return (
    <div className="auth-bg" aria-hidden="true">
      <div className="beam" />
      <div className="spot" />
      <div className="grid" />
    </div>
  );
}
