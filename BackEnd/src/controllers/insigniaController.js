const supabase = require('../config/supabase');
const Eco = 8;
const Deporte = 9;
const Arte = 10;

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
                .eq('insigniaID', Deporte)
                .single();

                    if(!insigniaUsuarioD){
                        iniciarInsignia(userID, Deporte, true);
                        console.log("Se ha creado la insigna con ID: " + Deporte);
                    }
                if(selectErrorD){
                    console.log("Error al crear la insignia de Deporte");
                }

            break;
            case "arte": 
                const { data: insigniaUsuarioA, error: selectErrorA } = await supabase
                    .from('insignias_usuario')
                    .select('*')
                    .eq('userID', userID)
                    .eq('insigniaID', Arte)
                    .single();

                    if(!insigniaUsuarioA){
                        iniciarInsignia(userID, Arte, true);
                        console.log("Se ha creado la insigna con ID: " + Arte);
                    }

                    if(selectErrorA){
                        console.log("Error al crear la insignia de Arte");
                    }
            break;
            case "eco":

                const { data: insigniaUsuarioE, error: selectErrorE } = await supabase
                    .from('insignias_usuario')
                    .select('*')
                    .eq('userID', userID)
                    .eq('insigniaID', Eco)
                    .single();

                    if(!insigniaUsuarioE){
                        iniciarInsignia(userID, Eco, true);
                        console.log("Se ha creado la insigna con ID: " + Eco);
                    }
                    
                    if(selectErrorE){
                        console.log("Error al crear la insignia Eco");
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

}

module.exports = { actualizarInsigniaCrear, iniciarInsignia, actualizarProgreso };
