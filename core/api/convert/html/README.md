How the HTML conversion works
=============================

Uses the "golang.org/x/net" repository package "html" to parse the HTML into a tree,
then walks the tree using processHeadings() to make a series of sections with a heading as their title and the following HTML as the body. 

Importantly, if a heading is within some other structure, that other structure is ignored in order to get the heading into the list. This seems to mostly work well, but may have some unintended side-effects.

On the subject of unintended side-effects, or rather their avoidance, "script" HTML tags and their contents are not passed through.

