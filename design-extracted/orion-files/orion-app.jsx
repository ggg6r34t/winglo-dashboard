// Standalone Orion entry point — renders just the Marketing Manager dashboard.

const OrionStandaloneApp = () => {
  const agent = window.WingloData.AGENT_BY_ID.marketing;
  return (
    <div className="orion-standalone">
      <window.OrionHub agent={agent} onBack={() => {}} />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<OrionStandaloneApp />);
