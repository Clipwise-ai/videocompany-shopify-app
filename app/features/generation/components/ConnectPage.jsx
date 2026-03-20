/* eslint-disable react/prop-types */
import { ConnectPageFormPanel } from "./connect-page/ConnectPageFormPanel";
import { ConnectPageGallery } from "./connect-page/ConnectPageGallery";
import { connectPageStyles as s } from "./connect-page/connectPageStyles";

export function ConnectPage({
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  authAction,
  onSubmit,
  onGoogleSubmit,
  authState,
}) {
  void authState;

  return (
    <div style={s.root}>
      <div style={s.card}>
        <ConnectPageFormPanel
          authMode={authMode}
          setAuthMode={setAuthMode}
          authForm={authForm}
          setAuthForm={setAuthForm}
          authAction={authAction}
          onSubmit={onSubmit}
          onGoogleSubmit={onGoogleSubmit}
        />
        <ConnectPageGallery />
      </div>
      <div style={s.pageFadeBottom} />

      <style>{`
        .card-content-wrap {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          grid-column: 1 / -1;
        }
        @media (min-width: 768px) {
          .md-visible-gallery {
            display: flex !important;
          }
          .card-content-wrap {
            grid-column: auto;
          }
        }
      `}</style>
    </div>
  );
}
