/**
 * Extracts a cookie from the cookie jar
 *
 * @param {string} key the key for the cookie
 *
 * @returns the value associated with the key
 */
export function extractCookie(key) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${key}=`))
    ?.split("=")[1];
}

/**
 * Ensures that the user has an id cookie in their cookie jar. If they dont,
 * it requests one from the server and adds it to the jar.
 */
export async function getUserCookie() {
  const userCookie = extractCookie("userCookie");
  if (userCookie === undefined) {
    const response = await fetch("/cookie", {
      method: "GET",
    });
    const { _id: cookie } = await response.json();
    document.cookie = `userCookie=${cookie}; SameSite=None; Secure; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
    console.log(`fetched new user cookie: ${cookie}`);
  } else {
    console.log(`existing user cookie: ${userCookie}`);
  }
}
