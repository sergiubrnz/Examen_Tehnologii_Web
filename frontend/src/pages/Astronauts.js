import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useParams, useLocation } from 'react-router';
import './Astronauts.css';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { RadioButton } from 'primereact/radiobutton';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import useHttp from '../http/use-http';


const SERVER = `${window.location.protocol}//${window.location.hostname}:8001`;

const AstronautsTable = () => {
    const params = useParams();
    const location = useLocation();
    const spacecraftId = location.state.spacecraftId.id;
    const newAstronaut = {
        id: null,
        name: '',
        maxSpeed: '',
        weigth: '',
    };

    const [astronauts, setAstronauts] = useState(null);
    const [astronaut, setAstronaut] = useState(newAstronaut);
    const [submitted, setSubmitted] = useState(false);
    const [astronautDialog, setAstronautDialog] = useState(false);
    const [deleteAstronautDialog, setDeleteAstronautDialog] = useState(false);
    const [deleteAstronautsDialog, setDeleteAstronautsDialog] = useState(false);
    const [selectedAstronauts, setSelectedAstronauts] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const { sendRequest } = useHttp();
    const toast = useRef(null);
    const dt = useRef(null);
    const navigate = useNavigate()

    useEffect(() => {
        sendRequest(
            {
                url: `${SERVER}/spacecraft/${spacecraftId}/astronauts`,
            },
            (data) => {
                setAstronauts(data);
                console.log(data);
            }
        );
    }, [sendRequest]);

    const openNew = () => {
        setAstronaut(newAstronaut);
        setSubmitted(false);
        setAstronautDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setAstronautDialog(false);
        setDeleteAstronautsDialog(false);
        setDeleteAstronautDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteAstronautsDialog(true);
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < astronauts.length; i++) {
            if (astronauts[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };

    const saveAstronaut = () => {
        console.log(spacecraftId);
        setSubmitted(true);
        if (astronaut.name.trim()) {
            let astronautsCopy = [...astronauts];
            let astronautCopy = { ...astronaut };
            if (astronaut.id) {
                const index = findIndexById(astronaut.id);
                astronautsCopy[index] = astronautCopy;
                sendRequest(
                    {
                        url: `${SERVER}/spacecraft/${spacecraftId}/astronaut/${astronaut.id}`,
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: {
                            name: astronaut.name,
                            rol: astronaut.rol,
                        },
                    },
                    (_data) => {
                        toast.current.show({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'astronaut Updated',
                            life: 3000,
                        });
                    }
                );
            } else {
                sendRequest(
                    {
                        url: `${SERVER}/spacecraft/${spacecraftId}/astronaut`,
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: {
                            name: astronaut.name,
                            rol: astronaut.rol,
                        },
                    },
                    (data) => {
                        astronautsCopy.push(data);
                        toast.current.show({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'astronaut Created',
                            life: 3000,
                        });
                    }
                );
            }
            setAstronauts(astronautsCopy);
            setAstronautDialog(false);
            setAstronaut(newAstronaut);
        }
    };

    const deleteSelectedAstronauts = () => {
        let astronautsCopy = astronauts.filter((val) => !selectedAstronauts.includes(val));
        selectedAstronauts.forEach((astronaut) =>
            sendRequest({ url: `${SERVER}/spacecraft/${spacecraftId}/astronaut/${astronaut.id}`, method: 'DELETE' })
        );
        setAstronauts(astronautsCopy);
        setDeleteAstronautsDialog(false);
        setSelectedAstronauts(null);
        toast.current.show({
            severity: 'success',
            summary: 'Successful',
            detail: 'astronauts Deleted',
            life: 3000,
        });
    };

    const onInputChange = (e, field) => {
        const value = (e.target && e.target.value) || '';
        let astronautCopy = { ...astronaut };
        astronautCopy[`${field}`] = value;
        setAstronaut(astronautCopy);
    };

    const editAstronaut = (astronaut) => {
        setAstronaut({ ...astronaut });
        setAstronautDialog(true);
    };

    const confirmDeleteAstronaut = (astronaut) => {
        setAstronaut({ ...astronaut });
        setDeleteAstronautDialog(true);
    };

    const rowActions = (rowData) => {
        return (
            <React.Fragment>
                <Button
                    icon='pi pi-pencil'
                    className='p-button-rounded p-button-success mr-2'
                    onClick={() => editAstronaut(rowData)}
                />
                <Button
                    icon='pi pi-trash'
                    className='p-button-rounded p-button-warning'
                    onClick={() => confirmDeleteAstronaut(rowData)}
                />
            </React.Fragment>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button
                    label='New'
                    icon='pi pi-plus'
                    className='p-button-success mr-2'
                    onClick={openNew}
                />
                <Button
                    label='Delete'
                    icon='pi pi-trash'
                    className='p-button-danger'
                    onClick={confirmDeleteSelected}
                    disabled={!selectedAstronauts || !selectedAstronauts.length}
                />
            </React.Fragment>
        );
    };

    const astronautDialogFooter = (
        <>
            <Button
                label='Cancel'
                icon='pi pi-times'
                className='p-button-text'
                onClick={hideDialog}
            />
            <Button
                label='Save'
                icon='pi pi-check'
                className='p-button-text'
                onClick={saveAstronaut}
            />
        </>
    );

    const header = (
        <div className='table-header'>
            <span className='p-input-icon-left'>
                <i className='pi pi-search' />
                <InputText
                    type='search'
                    onInput={(e) => setGlobalFilter(e.target.value)}
                    placeholder='Search'
                />
            </span>
        </div>
    );

    const deleteAstronautsDialogFooter = (
        <>
            <Button
                label='No'
                icon='pi pi-times'
                className='p-button-text'
                onClick={hideDialog}
            />
            <Button
                label='Yes'
                icon='pi pi-check'
                className='p-button-text'
                onClick={deleteSelectedAstronauts}
            />
        </>
    );

    const onRolChange = (e) => {
        let astronautCopy = { ...astronaut };
        astronautCopy.rol = e.value;
        setAstronaut(astronautCopy);
    };

    const deleteAstronaut = () => {
        let astronautsCopy = astronauts.filter((val) => val.id !== astronaut.id);
        setAstronauts(astronautsCopy);
        setDeleteAstronautDialog(false);
        const idToDelete = astronaut.id;
        setAstronaut(newAstronaut);
        sendRequest(
            { url: `${SERVER}/spacecraft/${spacecraftId}/astronaut/${idToDelete}`, method: 'DELETE' },
            (_data) => {
                toast.current.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'astronaut Deleted',
                    life: 3000,
                });
            }
        );
    };

    const deleteAstronautDialogFooter = (
        <>
            <Button
                label='No'
                icon='pi pi-times'
                className='p-button-text'
                onClick={hideDialog}
            />
            <Button
                label='Yes'
                icon='pi pi-check'
                className='p-button-text'
                onClick={deleteAstronaut}
            />
        </>
    );

    return (
        <div className="astronauts-table">
            <Toast ref={toast} />
            <div className="card">
                <Toolbar
                    right={leftToolbarTemplate}
                />
                <DataTable
                    ref={dt}
                    dataKey="id"
                    selection={selectedAstronauts}
                    onSelectionChange={(e) => setSelectedAstronauts(e.value)}
                    responsiveLayout='scroll'
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    value={astronauts}
                    header={header}
                    globalFilter={globalFilter}
                >
                    <Column
                        selectionMode="multiple"
                        exportable={false}></Column>
                    <Column
                        field="id"
                        header='Id'
                        sortable></Column>
                    <Column
                        field="name"
                        header='Name'
                        sortable></Column>
                    <Column
                        field="rol"
                        header='rol'
                        sortable></Column>
                    <Column
                        body={rowActions}
                        exportable={false}
                    ></Column>
                </DataTable>
            </div>
            <Dialog
                visible={astronautDialog}
                style={{ width: '450px' }}
                header='astronaut'
                modal
                className='p-fluid'
                footer={astronautDialogFooter}
                onHide={hideDialog}>
                <div className='field'>
                    <label htmlFor='name'>Name</label>
                    <InputTextarea
                        id='name'
                        value={astronaut.name}
                        onChange={(e) => onInputChange(e, 'name')}
                        required
                        className={classNames({
                            'p-invalid': submitted && !astronaut.name,
                        })}
                        rows={1}
                    />
                    <label htmlFor='rol'>Rol</label>

                    <div className='formgrid grid'>
                        <div className='field-radiobutton col-6'>
                            <RadioButton
                                inputId='rol1'
                                name='rol'
                                value='commander'
                                onChange={onRolChange}
                                checked={astronaut.rol === 'commander'}
                            />
                            <label htmlFor='rol1'>Commander</label>
                        </div>
                        <div className='field-radiobutton col-6'>
                            <RadioButton
                                inputId='rol2'
                                name='rol'
                                value='pilot'
                                onChange={onRolChange}
                                checked={astronaut.rol === 'pilot'}
                            />
                            <label htmlFor='rol2'>Pilot</label>
                        </div>
                        <div className='field-radiobutton col-6'>
                            <RadioButton
                                inputId='rol3'
                                name='rol'
                                value='tester'
                                onChange={onRolChange}
                                checked={astronaut.rol === 'tester'}
                            />
                            <label htmlFor='rol3'>Tester</label>
                        </div>
                    </div>
                    {((submitted && !astronaut.name) || (submitted && !astronaut.rol)) && (
                        <small className='p-error'>All data is required.</small>
                    )}
                </div>
            </Dialog>
            <Dialog
                visible={deleteAstronautDialog}
                style={{ width: '450px' }}
                header='Confirm'
                modal
                footer={deleteAstronautDialogFooter}
                onHide={hideDialog}>
                <div className='confirmation-content'>
                    {astronaut && (
                        <span>
                            Are you sure you want to delete astronaut with id <b>{astronaut.id}</b>?
                        </span>
                    )}
                </div>
            </Dialog>

            <Dialog
                visible={deleteAstronautsDialog}
                style={{ width: '450px' }}
                header='Confirm'
                modal
                footer={deleteAstronautsDialogFooter}
                onHide={hideDialog}>
                <div className='confirmation-content'>
                    {astronaut && (
                        <span>Are you sure you want to delete the selected data?</span>
                    )}
                </div>
            </Dialog>
        </div>
    );
};

export default AstronautsTable