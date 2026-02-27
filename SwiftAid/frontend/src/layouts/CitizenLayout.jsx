import Navbar from "../components/Navbar/Navbar";

function CitizenLayout({ children }) {
  return (
    <>
      <Navbar />
      <div style={{ padding: "30px" }}>
        {children}
      </div>
    </>
  );
}

export default CitizenLayout;