const express = require('express');
const app = express();
app.use(express.json());
const db = {
  query: (sql, valores, callback) => {
    console.log("Rodando no banco:", sql, valores);
    callback(null, { sucesso: true }); 
  }
};
app.post('/livros', (req, res) => {
  const titulo = req.body.titulo;
  const autor = req.body.autor;
  const sql = "INSERT INTO livros (titulo, autor) VALUES (?, ?)";
  
  db.query(sql, [titulo, autor], (erro, resultado) => {
    if (erro) {
      return res.status(500).json({ mensagem: "Erro ao cadastrar o livro" });
    }
    return res.status(201).json({ mensagem: "Livro cadastrado com sucesso!" });
  });
});
app.listen(3000, () => {
  console.log("Servidor rodando! Pode testar no Thunder Client.");
});