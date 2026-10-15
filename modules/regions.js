// =====================================================================
//  RÉGIONS — pays, provinces (Canada) et états (États-Unis)
//  COPIE IDENTIQUE de sercovier-soumission/public/js/regions.js : si tu modifies l'un, copie dans l'autre.
// =====================================================================
(function (racine) {
  const REGIONS = {
    CA: {
      fr: "Canada", en: "Canada", regionFr: "Province / territoire", regionEn: "Province / territory",
      liste: [
        ["AB", "Alberta", "Alberta"], ["BC", "Colombie-Britannique", "British Columbia"], ["PE", "Île-du-Prince-Édouard", "Prince Edward Island"],
        ["MB", "Manitoba", "Manitoba"], ["NB", "Nouveau-Brunswick", "New Brunswick"], ["NS", "Nouvelle-Écosse", "Nova Scotia"],
        ["NU", "Nunavut", "Nunavut"], ["ON", "Ontario", "Ontario"], ["QC", "Québec", "Quebec"], ["SK", "Saskatchewan", "Saskatchewan"],
        ["NL", "Terre-Neuve-et-Labrador", "Newfoundland and Labrador"], ["NT", "Territoires du Nord-Ouest", "Northwest Territories"], ["YT", "Yukon", "Yukon"],
      ],
    },
    US: {
      fr: "États-Unis", en: "United States", regionFr: "État", regionEn: "State",
      liste: [
        ["AL", "Alabama", "Alabama"], ["AK", "Alaska", "Alaska"], ["AZ", "Arizona", "Arizona"], ["AR", "Arkansas", "Arkansas"],
        ["CA", "Californie", "California"], ["NC", "Caroline du Nord", "North Carolina"], ["SC", "Caroline du Sud", "South Carolina"],
        ["CO", "Colorado", "Colorado"], ["CT", "Connecticut", "Connecticut"], ["ND", "Dakota du Nord", "North Dakota"], ["SD", "Dakota du Sud", "South Dakota"],
        ["DE", "Delaware", "Delaware"], ["DC", "District de Columbia", "District of Columbia"], ["FL", "Floride", "Florida"], ["GA", "Géorgie", "Georgia"],
        ["HI", "Hawaï", "Hawaii"], ["ID", "Idaho", "Idaho"], ["IL", "Illinois", "Illinois"], ["IN", "Indiana", "Indiana"], ["IA", "Iowa", "Iowa"],
        ["KS", "Kansas", "Kansas"], ["KY", "Kentucky", "Kentucky"], ["LA", "Louisiane", "Louisiana"], ["ME", "Maine", "Maine"], ["MD", "Maryland", "Maryland"],
        ["MA", "Massachusetts", "Massachusetts"], ["MI", "Michigan", "Michigan"], ["MN", "Minnesota", "Minnesota"], ["MS", "Mississippi", "Mississippi"],
        ["MO", "Missouri", "Missouri"], ["MT", "Montana", "Montana"], ["NE", "Nebraska", "Nebraska"], ["NV", "Nevada", "Nevada"],
        ["NH", "New Hampshire", "New Hampshire"], ["NJ", "New Jersey", "New Jersey"], ["NY", "New York", "New York"], ["NM", "Nouveau-Mexique", "New Mexico"],
        ["OH", "Ohio", "Ohio"], ["OK", "Oklahoma", "Oklahoma"], ["OR", "Oregon", "Oregon"], ["PA", "Pennsylvanie", "Pennsylvania"],
        ["RI", "Rhode Island", "Rhode Island"], ["TN", "Tennessee", "Tennessee"], ["TX", "Texas", "Texas"], ["UT", "Utah", "Utah"],
        ["VT", "Vermont", "Vermont"], ["VA", "Virginie", "Virginia"], ["WV", "Virginie-Occidentale", "West Virginia"], ["WA", "Washington", "Washington"],
        ["WI", "Wisconsin", "Wisconsin"], ["WY", "Wyoming", "Wyoming"],
      ],
    },
  };
  // Nom lisible : nomRegion("CA","QC","fr") → "Québec"
  function nomRegion(pays, code, lang) {
    const p = REGIONS[pays]; if (!p || !code) return code || "";
    const r = p.liste.find((x) => x[0] === code);
    return r ? (lang === "en" ? r[2] : r[1]) : code;
  }
  function nomPays(pays, lang) { const p = REGIONS[pays]; return p ? (lang === "en" ? p.en : p.fr) : pays || ""; }
  // Options <select> triées dans la langue voulue
  function optionsRegions(pays, choisi, lang) {
    const p = REGIONS[pays]; if (!p) return "";
    const i = lang === "en" ? 2 : 1;
    return p.liste.slice().sort((a, b) => a[i].localeCompare(b[i], lang === "en" ? "en" : "fr"))
      .map((r) => `<option value="${r[0]}" ${r[0] === choisi ? "selected" : ""}>${r[i]}</option>`).join("");
  }

  const api = { REGIONS, nomRegion, nomPays, optionsRegions };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else Object.assign(racine, api);
})(this);
