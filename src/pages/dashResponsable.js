import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import navigate from 'navigate';

function DashResponsable(){
    return (
        <div>
            <nav class="navbar navbar-expand-lg bg-body-tertiary">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#"><i class="bi bi-person-circle" title='Profil'></i></a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                                <a class="nav-link active" aria-current="page" href="#"><i class="bi bi-house"></i>Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#" >Tache</a>
                            </li>
                            <li class="nav-item">
                                <Link class="nav-link" to="/AjouteTache">Nouvelle Tache</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <h1>bienvenue au page responsable</h1>
        </div>
    );
};


export default DashResponsable;
