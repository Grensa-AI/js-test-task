// Получение резюме из локального хранилища браузера
export const getResume = () => {
    const resumeList = localStorage.getItem("resume");
    if (!resumeList) {
        localStorage.setItem("resume", JSON.stringify([]));
        return [];
    } 
    return JSON.parse(resumeList);
}

// Сохранение резюме в локальное хранилище браузера
export const saveResume = (resume) => {
    const resumeList = getResume();
    localStorage.setItem("resume", JSON.stringify([...resumeList, resume]));
}

// Удаление резюме из локального хранилище браузера по его индексу
export const removeResume = (index) => {
    const resumeList = getResume();
    localStorage.setItem("resume", JSON.stringify(resumeList.filter((r, i) => i !== index)));
}