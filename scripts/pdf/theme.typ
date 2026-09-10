#let template-theme(body) = {
  set page(
    paper: "a4",
    margin: (x: 38pt, top: 42pt, bottom: 46pt),
    header: context {
      let chapters = query(heading.where(level: 1).before(here()))
      if chapters.len() > 0 {
        align(right, text(8pt, fill: luma(100), chapters.last().body))
      }
    },
    footer: context {
      align(center, text(8pt, fill: luma(100), counter(page).display()))
    },
  )
  set text(font: ("Noto Serif", "Noto Serif CJK SC"), size: 9.5pt, lang: "zh", region: "cn")
  set par(justify: true, leading: .5em)
  set raw(tab-size: 2)
  show raw.where(block: true): it => block(
    fill: luma(246),
    radius: 3pt,
    inset: 8pt,
    width: 100%,
    breakable: true,
    { set text(font: "JetBrains Mono", size: 7.8pt); set par(justify: false); it },
  )
  show heading.where(level: 1): it => {
    pagebreak(weak: true)
    set text(16pt, weight: "bold")
    it
    v(.25em)
    line(length: 100%, stroke: .7pt + luma(190))
    v(.6em)
  }
  show heading.where(level: 2): it => {
    v(.8em)
    set text(12pt, weight: "bold")
    it
    v(.2em)
  }
  show quote.where(block: true): it => block(
    stroke: (left: 2pt + rgb("#5966d9")),
    inset: (left: 10pt, y: 4pt),
    it.body,
  )
  body
}
