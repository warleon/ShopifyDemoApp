import Head from "next/head";

export default function page() {
  return (
    <div>
      <form action="/api/login" method="POST">
        <h1>Login</h1>
        <p>
          Enter your email, we will send you a verification code to validate
          your identity
        </p>
        <label htmlFor="email">Email</label>
        <br />
        <input type="email" name="email" id="email" />
        <br />
        <input type="submit" value="Send Code" />
      </form>
    </div>
  );
}
