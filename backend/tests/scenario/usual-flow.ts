import { assertEquals } from "jsr:@std/assert";

Deno.test("simple test", () => {
    const x = 1 + 2;
    assertEquals(x, 3);
});

// 1. USER A creates a PROJECT and saves it to database


// 2. USER A adds an OBJECT and emits it as an event


// 3. USER B joins the project through URL and receives all PROJECT data correctly


// 4. USER B adds a keyframe to the OBJECT and this changes gets emmited to all connected USERS


// 5. USER B connection gets interrupted, meanwhile USER A adds another KEYFRAME to the OBJECT


// 6. USER B should signal synchronization issues



