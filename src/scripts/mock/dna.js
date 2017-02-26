

import DNA from "../lib/DNA.js";

export let Dna1 = DNA.decodeDna("S(F,R,E,F)");



export let Dna2 = DNA.decodeDna("S(,E(R,E(F(,R))),F)");
export let Dna3 = DNA.decodeDna("S(,G(,F(,E,F,),E,,),R,,)");


export let Dna4 = DNA.decodeDna("S(E,R,F(G,F))");
export let Dna5 = DNA.decodeDna("S(F(R,E),F(R,E),F(R,E))");
export let Dna6 = DNA.decodeDna("S(F(,E(G(,F(R,)),)),F(,E(R(,F(R,)),)))");
