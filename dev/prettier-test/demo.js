import * as prettier from "prettier";

const queries = [
  // Simple query
  '*[_type=="post"]{title,body}',

  // Query with filter and projection
  '*[_type == "post" && published == true]{ title, "slug": slug.current }',

  // Query with dereference
  '*[_type == "post"]{ title, author->{ name, image } }',

  // Complex query that should wrap
  '*[_type == "article" && published == true && category in ["tech", "science"]]{ title, "excerpt": pt::text(body)[0...200], author->{ name, "avatar": image.asset->url }, _createdAt }[0...10] | order(_createdAt desc)',

  // Query with multiple pipes
  '*[_type == "post"] | order(_createdAt desc) | { title, slug }',
];

console.log("GROQ Prettier Plugin Demo\n");
console.log("=".repeat(60));

for (const query of queries) {
  console.log("\nInput:");
  console.log(query);
  console.log("\nFormatted:");

  const formatted = await prettier.format(query, {
    parser: "groq",
    plugins: ["../../packages/prettier-plugin-groq/dist/index.js"],
    printWidth: 60,
  });

  console.log(formatted);
  console.log("-".repeat(60));
}
