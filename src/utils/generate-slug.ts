export function generateSlug(text: string): string {
  return text
    .normalize('NFD') // é => e´
    .replace(/[\u0300-\u036f]/g, '') // transforma tudo que é uma acentuação por caracter vazio ""
    .toLowerCase() // coloca tudo em caixa baixa
    .replace(/[^\w\s-]/g, '') // remover todos os caracteres que não são letras, números, espaços ou hífens de uma string
    .replace(/\s+/g, '-') // Quando sobra mais de um espaço em branco coloca hífen (-)
}
