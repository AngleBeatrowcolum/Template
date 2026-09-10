#import "/scripts/pdf/theme.typ": template-theme
#import "@preview/mitex:0.2.5": mi, mitex
#show: template-theme
#set document(title: "Template XCPC", author: "AngleBeatrowcolum")

#if sys.inputs.at("cover", default: "") == "1" [
  #set page(header: none, footer: none)
  #align(center + horizon)[
    #text(24pt, weight: "bold")[Template XCPC]
    #v(1em)
    #text(13pt, fill: luma(90))[竞赛算法模板库]
  ]
  #pagebreak()
  #set page(header: none)
  #text(17pt, weight: "bold")[目录]
  #v(.8em)
  #columns(2, gutter: 18pt)[#outline(title: none, depth: 2, indent: 1em)]
  #pagebreak()
]
