# Kræver din beslutning

Manuel pilotskabelon til det arbejde, der kræver operatørens vurdering. Udfyld kun relevante felter. Dette er ikke en scheduler, en automatisk godkendelse eller et nyt importformat.

**Dækning:** repository/kilder · tidspunkt for aflæsning · undersøgte sider/cursors · utilgængelige eller delvise kilder.

Medtag stadig åbne beslutninger fra tidligere perioder. En tom kø kan kun kaldes tom, når de aftalte kilder er læst. Saml kun poster, når beviserne peger på samme problem, og bevar kildelinks.

| Opgave / kilde | Beslutning | Anbefaling og grundlag | Bevis / head-SHA | Forbrug og mennesketid | Næste handling |
| --- | --- | --- | --- | --- | --- |
| Udfyld | Fx accepter scope, vælg produktadfærd, gennemse resultat eller afklar blokering | Hvad anbefales, og hvad ved vi endnu ikke? | Link til reviewpakke og den revision, den gælder | Faktisk / estimeret / ukendt | Én konkret handling under eksisterende autoritet |

En ny revision kræver nyt grundlag for accept. Lokal accept, PR-publicering, merge og deployment registreres hver for sig. Vis den nødvendige handling uden at bede om samme allerede givne tilladelse igen.

Efter en pilotrelease: knyt eventuelle tilbagevendende fejl til oprindelig opgave, tidligere fix, faktisk releaseversion og observationsperiode. Et lukket issue beviser ikke, at fejlen er væk i drift.

Detaljer og private før/efter-artifacts ligger i [reviewpakken](review-packet.md). Hold kundelogdata og sårbarhedsdetaljer på den godkendte private destination.
