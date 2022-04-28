export const stationLinesPopupTemplate = { 
  title: "{station}",
  content: [
    {
      type: "fields",
      fieldInfos: [
        {
          fieldName: "flighttime",
          label: "Flytid til hendelse"
        },
        {
          fieldName: "distance",
          label: "Distanse til hendelse (km)"
        },
        {
          fieldName: "rescuetime",
          label: "Tid til pasientkontakt (redningspersonell)"
        },
        {
          fieldName: "firstrespondertime",
          label: "Tid til pasientkontakt (lege)"
        }
      ]
    }
  ]
}

export const hospitalLinePopupTemplate = { 
  title: "{hospital}",
  content: [
    {
      type: "fields",
      fieldInfos: [
        {
          fieldName: "origin",
          label: "Helikopterstasjon"
        },
        {
          fieldName: "returntime",
          label: "Flytid til akuttmottak"
        },
        {
          fieldName: "returndistance",
          label: "Distanse til akuttmottak (km)"
        }
      ]
    }
  ]
}