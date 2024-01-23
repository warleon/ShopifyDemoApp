export default function page() {
  return (
    <div>
      <form action="/api/validate" method="POST">
        <h1>Code Validation</h1>
        <p>Enter the code that we sent you</p>
        <label htmlFor="code">Code</label>
        <br />
        <input type="text" name="code" id="code" maxLength={6} />
        <br />
        <input type="submit" value="Validete Code" />
      </form>
    </div>
  );
}

const style: { [key: string]: React.CSSProperties } = {
  noshow: {
    display: "none",
  },
};
