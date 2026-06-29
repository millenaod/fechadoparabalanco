export const FAMILIES = [
  { name: 'Família Cida', members: ['Cida', 'Millena', 'Luis', 'Suelen'] },
  { name: 'Família Eduarda', members: ['Eduarda', 'Lucas'] },
  { name: 'Família Márcia', members: ['Marcia', 'Jose Marcio', 'Iara', 'Vinicius', 'Marcela', 'Junior', 'Tulio'] },
  { name: null, members: ['Cristina'] },
  { name: 'Família Rose', members: ['Rose', 'Tio Luis', 'Livia', 'Tutty', 'Bruno', 'Ravena', 'Breno', 'Gabi'] },
  { name: 'Família Sergio', members: ['Salma', 'Tio Sergio', 'Luana', 'Allef'] },
  { name: 'Família Ana Carla', members: ['Ana Carla', 'Marlon', 'Clara', 'Maria Alice'] },
  { name: 'Família Sergio Henrique', members: ['Sergio Henrique', 'Heitor', 'Camila'] },
  { name: null, members: ['Gilson', 'Adriana'] },
  { name: 'Família Tonho', members: ['Tio Tonho', 'Celia', 'Leticia', 'Felipe'] },
  { name: 'Família Fernanda', members: ['Fernanda', 'Luis Arthur', 'Cecilia', 'Francisco'] },
  { name: 'Família Samuel', members: ['Samuel', 'Maria Betriz'] },
]

export const ALL_MEMBERS = FAMILIES.flatMap((f) => f.members)

export const ADMIN_USER = 'Millena'
