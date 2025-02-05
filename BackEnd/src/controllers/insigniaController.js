const supabase = require('../config/supabase');
const EcoCrear = 8;
const DeporteCrear = 9;
const ArteCrear = 10;
const ArteAsistir = 5;
const DeporteAsistir = 4;
const EcoAsistir = 3;

const actualizarInsigniaCrear = async (userID, tematica) =>{

    try{
        const { data: insigniaUsuario, error: selectError } = await supabase
            .from('insignias_usuario')
            .select('*')
            .eq('userID', userID)
            .eq('insigniaID', 2)
            .single();

        if(insigniaUsuario){
            actualizarProgreso(userID, 2);
        }else{
            iniciarInsignia(userID, 2, false);
        }
        console.log("La insignia se ha creado correctamente");
        console.log(tematica);

        switch(tematica){
            case "deportes": 
                const { data: insigniaUsuarioD, error: selectErrorD} = await supabase
                .from('insignias_usuario')
                .select('*')
                .eq('userID', userID)
                .eq('insigniaID', DeporteCrear)
                .single();

                    if(!insigniaUsuarioD){
                        iniciarInsignia(userID, DeporteCrear, true);
                        console.log("Se ha creado la insigna con ID: " + DeporteCrear);
                    }

            break;
            case "arte": 
                const { data: insigniaUsuarioA, error: selectErrorA } = await supabase
                    .from('insignias_usuario')
                    .select('*')
                    .eq('userID', userID)
                    .eq('insigniaID', ArteCrear)
                    .single();

                    if(!insigniaUsuarioA){
                        iniciarInsignia(userID, ArteCrear, true);
                        console.log("Se ha creado la insigna con ID: " + ArteCrear);
                    }

            break;
            case "voluntariado":

                const { data: insigniaUsuarioE, error: selectErrorE } = await supabase
                    .from('insignias_usuario')
                    .select('*')
                    .eq('userID', userID)
                    .eq('insigniaID', EcoCrear)
                    .single();

                    if(!insigniaUsuarioE){
                        iniciarInsignia(userID, EcoCrear, true);
                        console.log("Se ha creado la insigna con ID: " + EcoCrear);
                    }
                    
            break;
            default: 
                console.log("Aquí no se a entrado en ningún caso");
            break;
        }


    }catch(error){
        console.log("Error 1");
        console.log(error.message);
    }

}

const iniciarInsignia = async (userID, insigniaID, desbloquear) =>{
    const { error: insertError } = await supabase
        .from('insignias_usuario')
        .insert([{ userID: userID, insigniaID: insigniaID, progreso_actual: 1, desbloqueada: desbloquear, fecha: new Date()}]);
    
    console.log("Se ha iniciado la insignia correctamente");
    if(insertError){ console.log("Error 2");};
}

const actualizarProgreso = async (userID, insigniaID) =>{
    try{
        const {data: insigniaUsuario, error: selectError } = await supabase
        .from('insignias_usuario')
        .select('*')
        .eq('userID', userID)
        .eq('insigniaID', insigniaID)
        .single();
        
        if (selectError) {
            console.log("Error 3");
        }

        if(insigniaUsuario){
            if (!insigniaUsuario.desbloqueada) {

                const {data: insignia, error: insigniaError} = await supabase
                    .from('insignias')
                    .select('*')
                    .eq('id', insigniaID)
                    .single();


                if(insigniaError){
                    console.log("El error al buscar la insignia es: " + insigniaError);
                }
                
                const nuevoProgreso = insigniaUsuario.progreso_actual + 1;

                console.log("Nuevo Progreso: " + nuevoProgreso);
                console.log("Criterio Min: " + insignia.criterioMin);//Pone UNDEFINED MIRAR
                

                if(nuevoProgreso == insignia.criterioMin){
                    const { error: updateError } = await supabase
                        .from('insignias_usuario')
                        .update({ progreso_actual: nuevoProgreso, desbloqueada: true})
                        .eq('userID', userID)
                        .eq('insigniaID', insigniaID);

                        console.log("La isnignia se ha completado con éxito");

                        if(updateError){
                            console.log("Error 4");
                            console.log(updateError);
                        }
                }else{
                    const { error: updateError } = await supabase
                        .from('insignias_usuario')
                        .update({ progreso_actual: nuevoProgreso })
                        .eq('userID', userID)
                        .eq('insigniaID', insigniaID);

                        console.log("La isnignia se ha actualizado correctamente");

                        if(updateError){
                            console.log("Error 5");
                            console.log(updateError);
                        }
                }                
            }
        }
    }catch(error){
        console.log("Error 6");
        console.log(error.message);
    }
};

const actualizarInsigniaAsistir = async (userID, tematica) =>{
    try{
        const { data: insigniaUsuario, error: selectError } = await supabase
            .from('insignias_usuario')
            .select('*')
            .eq('userID', userID)
            .eq('insigniaID', 1)
            .single();

        if(insigniaUsuario){
            actualizarProgreso(userID, 1);
        }else{
            iniciarInsignia(userID, 1, false);
        }
        console.log("La insignia se ha creado correctamente");
        console.log(tematica);

        switch(tematica){
            case "deportes": 
                const { data: insigniaUsuarioD, error: selectErrorD} = await supabase
                .from('insignias_usuario')
                .select('*')
                .eq('userID', userID)
                .eq('insigniaID', DeporteAsistir)
                .single();

                    if(!insigniaUsuarioD){
                        iniciarInsignia(userID, DeporteAsistir, true);
                        console.log("Se ha creado la insigna con ID: " + DeporteAsistir);
                    }

            break;
            case "arte": 
                const { data: insigniaUsuarioA, error: selectErrorA } = await supabase
                    .from('insignias_usuario')
                    .select('*')
                    .eq('userID', userID)
                    .eq('insigniaID', ArteAsistir)
                    .single();

                    if(!insigniaUsuarioA){
                        iniciarInsignia(userID, ArteAsistir, true);
                        console.log("Se ha creado la insigna con ID: " + ArteAsistir);
                    }

            break;
            case "voluntariado":

                const { data: insigniaUsuarioE, error: selectErrorE } = await supabase
                    .from('insignias_usuario')
                    .select('*')
                    .eq('userID', userID)
                    .eq('insigniaID', EcoAsistir)
                    .single();

                    if(!insigniaUsuarioE){
                        iniciarInsignia(userID, EcoAsistir, true);
                        console.log("Se ha creado la insigna con ID: " + EcoAsistir);
                    }
                    
            break;
            default: 
                console.log("Aquí no se a entrado en ningún caso");
            break;
        }


    }catch(error){
        console.log("Error 1");
        console.log(error.message);
    }
}


const obtenerLogradas = async (req,res) =>{
    const {userID} = req.params;


    try {
        const { data, error } = await supabase
            .from('insignias_usuario')
            .select(`
                insignias(*), progreso_actual
            `)
            .eq('userID', userID);
        
        const logrosAdaptados = data.map((logro) => ({
            id: logro.insignias.id,
            nombre: logro.insignias.nombre,
            descripcion: logro.insignias.descripcion,
            icono: logro.insignias.icono || 'https://via.placeholder.com/50',
            progreso: logro.progreso_actual,
            meta: logro.insignias.criterioMin,
        }));
        if (error) {
          return res.status(500).json({ message: 'Error al obtener las insignias', error});
        }
        return res.status(200).json({message: 'Las insignias se deberían de recoger bien', logrosAdaptados});
      }catch(error){
          return res.status(500).json({ message: 'Error del servidor(Insignia)', error});
      };

};



module.exports = { actualizarInsigniaCrear, actualizarInsigniaAsistir,  iniciarInsignia, actualizarProgreso, obtenerLogradas};
