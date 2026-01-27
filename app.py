from flask import Flask, render_template, request, redirect, url_for, jsonify, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os
from urllib.parse import unquote

# Import de ta fonction de calcul (on devra l'adapter légèrement pour la DB plus tard)
from backend.calculmoy import calculer_moyennes_semestre

app = Flask(__name__, 
            template_folder='frontend', 
            static_folder='frontend', 
            static_url_path='')

# CONFIGURATION
app.config['SECRET_KEY'] = 'dev_key_123' # À changer en prod
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'backend', 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'auth'

PATH_DATA = os.path.join('backend', 'data.json')

# --- MODÈLES DE LA BASE DE DONNÉES ---

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False) # On remplace username par email
    password = db.Column(db.String(200), nullable=False)
    notes = db.relationship('Note', backref='owner', cascade="all, delete-orphan")

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), nullable=False)
    valeur = db.Column(db.Float, nullable=False)
    coef = db.Column(db.Float, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# --- FONCTION UTILITAIRE ---

def charger_json(chemin):
    if os.path.exists(chemin):
        with open(chemin, 'r', encoding='utf-8') as f:
            try:
                content = f.read().strip()
                return json.loads(content) if content else {}
            except json.JSONDecodeError:
                return {}
    return {}

def get_notes_dict_for_user(user_id):
    """Transforme les notes de la DB en dictionnaire pour ton script de calcul."""
    notes = Note.query.filter_by(user_id=user_id).all()
    dico = {}
    for n in notes:
        if n.code not in dico:
            dico[n.code] = []
        dico[n.code].append({"note": n.valeur, "coef": n.coef})
    return dico

# --- ROUTES ---

@app.route('/auth', methods=['GET', 'POST'])
def auth():
    if request.method == 'POST':
        action = request.form.get('action')
        email = request.form.get('email') # On récupère l'email
        password = request.form.get('password')

        if action == 'register':
            if User.query.filter_by(email=email).first(): # Vérification par email
                flash('Cet email est déjà utilisé.')
            else:
                hashed_pw = generate_password_hash(password)
                new_user = User(email=email, password=hashed_pw)
                db.session.add(new_user)
                db.session.commit()
                flash('Compte créé ! Connectez-vous.')
        
        elif action == 'login':
            user = User.query.filter_by(email=email).first() # Recherche par email
            if user and check_password_hash(user.password, password):
                login_user(user)
                return redirect(url_for('index'))
            flash('Email ou mot de passe incorrect.')
            
    return render_template('auth.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth'))

@app.route('/', methods=['GET', 'POST'])
@login_required
def index():
    data = charger_json(PATH_DATA)
    notes_enregistrees = get_notes_dict_for_user(current_user.id)
    
    annees = list(data.keys())
    poles_a_afficher = []
    
    # On initialise les deux dictionnaires vides
    moyennes_poles = {}
    moyennes_matieres = {}
    
    annee_sel = request.form.get('annee') or request.args.get('annee')
    sem_sel = request.form.get('semestre') or request.args.get('semestre')
    
    if annee_sel and sem_sel:
        poles_a_afficher = data.get(annee_sel, {}).get(sem_sel, [])
        # On récupère le dictionnaire global contenant les deux types de moyennes
        res = calculer_moyennes_semestre(PATH_DATA, notes_enregistrees, annee_sel, sem_sel)
        moyennes_poles = res['poles']
        moyennes_matieres = res['matieres']

    return render_template('main.html', 
                           annees=annees, 
                           poles=poles_a_afficher, 
                           annee_sel=annee_sel, 
                           sem_sel=sem_sel,
                           moyennes_poles=moyennes_poles,    # Changé
                           moyennes_matieres=moyennes_matieres, # Ajouté
                           notes_enregistrees=notes_enregistrees,
                           email=current_user.email)

@app.route('/enregistrer', methods=['POST'])
@login_required
def enregistrer():
    form_data = request.form
    annee_origine = form_data.get('annee_origine')
    semestre_origine = form_data.get('semestre_origine')

    for key in form_data:
        if key.startswith('note-'):
            code = key.replace('note-', '')
            list_n = form_data.getlist(f'note-{code}')
            list_c = form_data.getlist(f'coef-{code}')
            
            for n, c in zip(list_n, list_c):
                if n.strip() and c.strip():
                    nouvelle_note = Note(
                        code=code, 
                        valeur=float(n), 
                        coef=float(c), 
                        user_id=current_user.id
                    )
                    db.session.add(nouvelle_note)

    db.session.commit()
    return redirect(url_for('index', annee=annee_origine, semestre=semestre_origine))

@app.route('/supprimer-note/<code>/<int:index>', methods=['POST'])
@login_required
def supprimer_note(code, index):
    # On décode le code (ex: 'Math%20App' devient 'Math App')
    code_decode = unquote(code)
    
    # Récupération des notes de l'utilisateur pour cette matière précise
    notes = Note.query.filter_by(user_id=current_user.id, code=code_decode).all()
    
    if 0 <= index < len(notes):
        try:
            db.session.delete(notes[index])
            db.session.commit()
            return jsonify({"status": "success"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"status": "error", "message": str(e)}), 500
            
    return jsonify({"status": "error", "message": "Note non trouvée"}), 404

if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Crée la base de données et les tables
    app.run(debug=True, port=5000)