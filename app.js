'use strict'

let itens = []

function mostrarTela(telaId) {
  document.querySelectorAll('section').forEach(sec => sec.classList.add('hidden'))
  document.getElementById(telaId).classList.remove('hidden')
}

async function buscarDados(categoria) {
  const url = `https://api.attackontitanapi.com/${categoria}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Erro ao buscar dados (${response.status})`)
  }

  const json = await response.json()
  return json.results || (Array.isArray(json) ? json : [])
}

function getImagemValida(item) {
  const url = item.picture_url || item.img || ''
  const extensoesValidas = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const proxy = 'https://images.weserv.nl/?url='

  if (typeof url !== 'string' || !url.startsWith('http')) {
    return 'https://via.placeholder.com/300x200?text=Sem+Imagem'
  }

  try {
    new URL(url)
    if (extensoesValidas.some(ext => url.toLowerCase().includes(ext))) {
      const urlSemProtocolo = url.replace(/^https?:\/\//, '')
      return proxy + urlSemProtocolo
    }
    return 'https://via.placeholder.com/300x200?text=Imagem+Inválida'
  } catch {
    return 'https://via.placeholder.com/300x200?text=URL+Quebrada'
  }
}

function mostrarGaleria(lista) {
  const galeria = document.getElementById('galeria')
  galeria.innerHTML = ''

  lista.forEach(item => {
    const card = document.createElement('div')
    card.classList.add('card')

    card.innerHTML = `
      <img src="${getImagemValida(item)}" alt="${item.name}">
      <h3>${item.name}</h3>
      <button>Ver mais</button>
    `

    card.querySelector('button').addEventListener('click', () => verDetalhes(item))
    galeria.appendChild(card)
  })
}

async function carregarCategoria(categoria) {
  mostrarTela('lista')
  const galeria = document.getElementById('galeria')
  galeria.innerHTML = '<p>Carregando...</p>'

  try {
    itens = await buscarDados(categoria)
    galeria.innerHTML = itens.length ? '' : '<p>Nenhum item encontrado.</p>'
    if (itens.length) mostrarGaleria(itens)
  } catch (err) {
    galeria.innerHTML = '<p>Erro ao carregar dados.</p>'
    alert(err.message)
  }
}

function verDetalhes(item) {
  mostrarTela('detalhe')

  document.getElementById('tituloDetalhe').textContent = item.name
  document.getElementById('imagemDetalhe').src = getImagemValida(item)

  let campos = {}

  if (item.gender || item.occupation) {

    campos = {
      gender: 'Gênero',
      age: 'Idade',
      height: 'Altura',
      residence: 'Residência',
      status: 'Status',
      occupation: 'Ocupação',
      birthplace: 'Local de Nascimento',
      group: 'Grupo'
    }
  } else if (item.region || item.wall || item.description) {

    campos = {
      name: 'Nome',
      region: 'Região',
      wall: 'Muralha',
      residents: 'Residentes',
      description: 'Descrição'
    }
  } else if (item.species || item.height_range || item.height || item.abilities) {
 
    campos = {
      species: 'Espécie',
      height: 'Altura',
      height_range: 'Faixa de Altura',
      abilities: 'Habilidades',
      description: 'Descrição'
    }
  } else {

    campos = {
      description: 'Descrição'
    }
  }

  let html = ''

  for (const [chave, label] of Object.entries(campos)) {
    const valor = item[chave]
    if (valor && valor.length) {
      const val = Array.isArray(valor) ? valor.join(', ') : valor
      if (typeof val !== 'string' || !val.startsWith('http')) {
        html += `<b>${label}:</b> ${val}<br>`
      }
    }
  }

  document.getElementById('descricaoDetalhe').innerHTML =
    html.trim() || '<i>Descrição não encontrada.</i>'
}

function voltarInicio() {
  mostrarTela('home')
}

document.getElementById('pesquisa').addEventListener('input', () => {
  const termo = document.getElementById('pesquisa').value.toLowerCase().trim()
  const filtrados = itens.filter(i => i.name.toLowerCase().includes(termo))
  mostrarGaleria(filtrados)
})

window.carregarCategoria = carregarCategoria
window.voltarInicio = voltarInicio
