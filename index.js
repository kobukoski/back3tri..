const express = require("express")
const app = express()
app.use(express.json())
const port = 3000
const db = require("./db")

// --- ROTAS DE AULA ---

app.get("/aula", async (req, res) => {
    try {
        const resultado = await db.pool.query("SELECT * FROM aula")
        res.status(200).json(resultado[0])
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar aulas." })
    }
})

app.post("/aula", async (req, res) => {
    try {
        const dados = req.body
        const resultado = await db.pool.query(
            "INSERT INTO aula (serie, turma, componente, professor) VALUES (?, ?, ?, ?)",
            [dados.serie, dados.turma, dados.componente, dados.professor]
        )
        res.status(201).json({ mensagem: "Aula cadastrada, ID = " + resultado[0].insertId })
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao cadastrar aula." })
    }
})

app.delete("/aula/:id", async (req, res) => {
    try {
        const { id } = req.params
        
        const [existe] = await db.pool.query("SELECT id FROM aula WHERE id = ?", [id])
        if (existe.length === 0) {
            return res.status(404).json({ erro: "Aula não encontrada." })
        }
        
        await db.pool.query("DELETE FROM aula WHERE id = ?", [id])
        res.status(200).json({ mensagem: "Aula excluída." })
    } catch (erro) {
        if (erro.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(400).json({ erro: "Aula possui horários, não pode ser excluída." })
        }
        res.status(500).json({ erro: "Erro ao excluir aula." })
    }
})

// --- ROTAS DE HORÁRIO ---

app.post("/horario", async (req, res) => {
    try {
        const { idaula, dia_semana, ordem } = req.body
        
        if (!idaula || !dia_semana || !ordem) {
            return res.status(400).json({ erro: "Faltam dados (idaula, dia_semana, ordem)." })
        }
        
        const resultado = await db.pool.query(
            "INSERT INTO horario_aula (idaula, dia_semana, ordem) VALUES (?, ?, ?)",
            [idaula, dia_semana, ordem]
        )
        res.status(201).json({ mensagem: "Horário cadastrado, ID = " + resultado[0].insertId })
    } catch (erro) {
        if (erro.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({ erro: "A aula informada não existe." })
        }
        res.status(500).json({ erro: "Erro ao cadastrar horário." })
    }
})

app.get("/horario/:dia", async (req, res) => {
    try {
        const { dia } = req.params
        const [linhas] = await db.pool.query(
            `SELECT h.id, h.dia_semana, h.ordem, a.componente, a.professor 
             FROM horario_aula h 
             JOIN aula a ON a.id = h.idaula 
             WHERE h.dia_semana = ? 
             ORDER BY h.ordem`, 
            [dia]
        )
        
        if (linhas.length === 0) {
            return res.status(404).json({ erro: "Nenhum horário neste dia." })
        }
        
        res.status(200).json(linhas)
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar horários." })
    }
})

app.delete("/horario/:id", async (req, res) => {
    try {
        const { id } = req.params
        const [resultado] = await db.pool.query("DELETE FROM horario_aula WHERE id = ?", [id])
        
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: "Horário não encontrado." })
        }
        
        res.status(200).json({ mensagem: "Horário excluído." })
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao excluir horário." })
    }
})

app.listen(port, () => {
    console.log("API rodando na porta " + port)
})
// No Rapid Client:
// GET http://127.0.0.1:3000/aula