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
       if (selectError) {
           // Mostrar ERROR
         }

      if(insigniaUsuario){
            actualizarProgreso(userID, 1);
      }else{
            iniciarInsignia(userID, 1, false);
        if(insertError){
            //Mostrar error
        }
        return res.status(200).json({ message: 'Insignia creada correctamente'});
      }
    }catch(error){
        return res.status(500).json({ message: 'Error al actualizar la insignia al crear evento:', error });
    }

}

const iniciarInsignia = async (userID, insigniaID, desbloquear) =>{
    const { error: insertError } = await supabase
        .from('insignias_usuario')
        .insert([{ userID: userID, insigniaID: insigniaID, progreso_actual: 1, desbloqueada: desbloquear, fecha: new Date()}]);
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
            return res.status(500).json({ message: 'Error al recoger la insignia', error });
        }

        if(insigniaUsuario){
            if (!insigniaUsuario.desbloqueada) {

                const {data: insignia, error: insigniaError} = await supabase
                    .select('*')
                    .from('insignias')
                    .eq('id', insigniaID);
                
                const nuevoProgreso = insigniaUsuario.progreso_actual + 1;

                if(nuevoProgreso == insignia.criterioMin){
                    const { error: updateError } = await supabase
                        .from('insignias_usuario')
                        .update({ progreso_actual: nuevoProgreso, desbloqueada: true})
                        .eq('usuario_id', userID)
                        .eq('insignia_id', insigniaID);
                }else{
                    const { error: updateError } = await supabase
                        .from('insignias_usuario')
                        .update({ progreso_actual: nuevoProgreso })
                        .eq('usuario_id', userID)
                        .eq('insignia_id', insigniaID);

                        if(updateError){
                            return res.status(500).json({ message: 'Error al actualizar la insignia', error: updateError});
                        }
                }                
            }
        }

    }catch(error){

    }
}

const actualizarInsigniaAsistir = async (userID, tematica) =>{

}

module.exports = { actualizarInsigniaCrear };
module.exports = { actualizarInsigniaAsistir };
