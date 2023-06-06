export function extractCookie(key) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${key}=`))
    ?.split("=")[1];
}

export async function getUserCookie() {
  const userCookie = extractCookie("userCookie");
  if (userCookie === undefined) {
    const response = await fetch("/cookie", {
      method: "GET",
    });
    const { _id: cookie } = await response.json();
    document.cookie = `userCookie=${cookie}; SameSite=None; Secure`;
    console.log(`fetched new user cookie: ${cookie}`);
  } else {
    console.log(`existing user cookie: ${userCookie}`);
  }
}
