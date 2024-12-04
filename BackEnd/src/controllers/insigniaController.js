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
            .eq('insigniaID', 1)
            .single();

        if(insigniaUsuario){
            actualizarProgreso(userID, 1);
        }else{
            iniciarInsignia(userID, 1, false);
        }
        console.log("La insignia se ha creado correctamente");
    }catch(error){
        console.log("Error 1");
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
                    .eq('id', insigniaID);
                
                const nuevoProgreso = insigniaUsuario.progreso_actual + 1;

                if(nuevoProgreso == insignia.criterioMin){
                    const { error: updateError } = await supabase
                        .from('insignias_usuario')
                        .update({ progreso_actual: nuevoProgreso, desbloqueada: true})
                        .eq('usuario_id', userID)
                        .eq('insignia_id', insigniaID);

                        console.log("La isnignia se ha completado con éxito");

                        if(updateError){
                            console.log("Error 4");
                        }
                }else{
                    const { error: updateError } = await supabase
                        .from('insignias_usuario')
                        .update({ progreso_actual: nuevoProgreso })
                        .eq('usuario_id', userID)
                        .eq('insignia_id', insigniaID);

                        console.log("La isnignia se ha actualizado correctamente");

                        if(updateError){
                            console.log("Error 5");
                        }
                }                
            }
        }
    }catch(error){
        console.log("Error 6");
        console.log(error.message);
    }
}

const actualizarInsigniaAsistir = async (userID, tematica) =>{

}

module.exports = { actualizarInsigniaCrear, iniciarInsignia, actualizarProgreso };
