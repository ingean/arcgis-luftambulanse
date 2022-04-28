export const minutesToHours = (totalMinutes) => {
  totalMinutes = Math.round(totalMinutes)
  const minutes = totalMinutes % 60
  const hours = Math.floor(totalMinutes / 60)

  return (hours > 0) 
  ? `${hours}t ${padTo2Digits(minutes)} min` 
  : `${padTo2Digits(minutes)} min`
}

const padTo2Digits = (num) => {
  return num.toString().padStart(2, '0')
}