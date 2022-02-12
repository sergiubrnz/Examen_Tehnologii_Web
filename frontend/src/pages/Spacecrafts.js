import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import './Spacecrafts.css';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import useHttp from '../http/use-http';

const SERVER = `${window.location.protocol}//${window.location.hostname}:8001`;

const SpacecraftsTable = () => {
    const newSpacecraft = {
        id: null,
        name: '',
        maxSpeed: '',
        weigth: '',
    };

    const [spacecrafts, setSpacecrafts] = useState(null);
    const [spacecraft, setSpacecraft] = useState(newSpacecraft);
    const [submitted, setSubmitted] = useState(false);
    const [spacecraftDialog, setSpacecraftDialog] = useState(false);
    const [deleteSpacecraftDialog, setDeleteSpacecraftDialog] = useState(false);
    const [deleteSpacecraftsDialog, setDeleteSpacecraftsDialog] = useState(false);
    const [selectedSpacecrafts, setSelectedSpacecrafts] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const { sendRequest } = useHttp();
    const toast = useRef(null);
    const dt = useRef(null);
    const navigate = useNavigate()

    useEffect(() => {
        sendRequest(
            {
                url: `${SERVER}/spacecrafts`,
            },
            (data) => {
                setSpacecrafts(data);
                console.log(data);
            }
        );
    }, [sendRequest]);

    const openNew = () => {
        setSpacecraft(newSpacecraft);
        setSubmitted(false);
        setSpacecraftDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setSpacecraftDialog(false);
        setDeleteSpacecraftsDialog(false);
        setDeleteSpacecraftDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteSpacecraftsDialog(true);
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < spacecrafts.length; i++) {
            if (spacecrafts[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };

    const saveSpacecraft = () => {
        setSubmitted(true);
        if (spacecraft.name.trim()) {
            let spacecraftsCopy = [...spacecrafts];
            let spacecraftCopy = { ...spacecraft };
            if (spacecraft.id) {
                const index = findIndexById(spacecraft.id);
                spacecraftsCopy[index] = spacecraftCopy;
                sendRequest(
                    {
                        url: `${SERVER}/spacecraft/${spacecraft.id}`,
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: {
                            name: spacecraft.name,
                            maxSpeed: spacecraft.maxSpeed,
                            weigth: spacecraft.weigth
                        },
                    },
                    (_data) => {
                        toast.current.show({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Spacecraft Updated',
                            life: 3000,
                        });
                    }
                );
            } else {
                sendRequest(
                    {
                        url: `${SERVER}/spacecraft`,
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: {
                            name: spacecraft.name,
                            maxSpeed: spacecraft.maxSpeed,
                            weigth: spacecraft.weigth
                        },
                    },
                    (data) => {
                        spacecraftsCopy.push(data);
                        toast.current.show({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Spacecraft Created',
                            life: 3000,
                        });
                    }
                );
            }
            setSpacecrafts(spacecraftsCopy);
            setSpacecraftDialog(false);
            setSpacecraft(newSpacecraft);
        }
    };

    const deleteSelectedSpacecrafts = () => {
        let spacecraftsCopy = spacecrafts.filter((val) => !selectedSpacecrafts.includes(val));
        selectedSpacecrafts.forEach((Spacecraft) =>
            sendRequest({ url: `${SERVER}/spacecraft/${Spacecraft.id}`, method: 'DELETE' })
        );
        setSpacecrafts(spacecraftsCopy);
        setDeleteSpacecraftsDialog(false);
        setSelectedSpacecrafts(null);
        toast.current.show({
            severity: 'success',
            summary: 'Successful',
            detail: 'Spacecrafts Deleted',
            life: 3000,
        });
    };

    const importCSV = (e) => {
        const file = e.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const csv = e.target.result;
            const data = csv.split('\n');

            const cols = data[0].replace(/['"]+/g, '').split(',');
            data.shift();
            const importedData = data.map((d) => {
                d = d.split(',');
                return cols.reduce((obj, c, i) => {
                    obj[c] = d[i].replace(/['"]+/g, '');
                    return obj;
                }, {});
            });

            const spacecraftsCopy = [...spacecrafts, ...importedData];

            setSpacecrafts(spacecraftsCopy);
        };

        reader.readAsText(file, 'UTF-8');
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, field) => {
        const value = (e.target && e.target.value) || '';
        let spacecraftCopy = { ...spacecraft };
        spacecraftCopy[`${field}`] = value;
        setSpacecraft(spacecraftCopy);
    };

    const editSpacecraft = (spacecraft) => {
        setSpacecraft({ ...spacecraft });
        setSpacecraftDialog(true);
    };

    const confirmDeleteSpacecraft = (spacecraft) => {
        setSpacecraft({ ...spacecraft });
        setDeleteSpacecraftDialog(true);
    };

    const rowActions = (rowData) => {
        return (
            <React.Fragment>
                <Button
                    icon='pi pi-book'
                    className='p-button-rounded p-button-info mr-2'
                    onClick={() => navigate(`/astronauts`, {
                        state: {
                            spacecraftId: rowData
                        }
                    })}
                />
                <Button
                    icon='pi pi-pencil'
                    className='p-button-rounded p-button-success mr-2'
                    onClick={() => editSpacecraft(rowData)}
                />
                <Button
                    icon='pi pi-trash'
                    className='p-button-rounded p-button-warning'
                    onClick={() => confirmDeleteSpacecraft(rowData)}
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
                    disabled={!selectedSpacecrafts || !selectedSpacecrafts.length}
                />
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <FileUpload
                    mode='basic'
                    name='demo[]'
                    auto
                    url='https://primefaces.org/primereact/showcase/upload.php'
                    accept='.csv'
                    chooseLabel='Import'
                    className='mr-2 inline-block'
                    onUpload={importCSV}
                />
                <Button
                    label='Export'
                    icon='pi pi-upload'
                    className='p-button-help'
                    onClick={exportCSV}
                />
            </React.Fragment>
        );
    };

    const spacecraftDialogFooter = (
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
                onClick={saveSpacecraft}
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

    const deleteSpacecraftsDialogFooter = (
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
                onClick={deleteSelectedSpacecrafts}
            />
        </>
    );

    const deleteSpacecraft = () => {
        let spacecraftsCopy = spacecrafts.filter((val) => val.id !== spacecraft.id);
        setSpacecrafts(spacecraftsCopy);
        setDeleteSpacecraftDialog(false);
        const idToDelete = spacecraft.id;
        setSpacecraft(newSpacecraft);
        sendRequest(
            { url: `${SERVER}/spacecraft/${idToDelete}`, method: 'DELETE' },
            (_data) => {
                toast.current.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Spacecraft Deleted',
                    life: 3000,
                });
            }
        );
    };

    const deleteSpacecraftDialogFooter = (
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
                onClick={deleteSpacecraft}
            />
        </>
    );

    return (
        <div className="spacecrafts-table">
            <Toast ref={toast} />
            <div className="card">
                <Toolbar
                    left={leftToolbarTemplate}
                    right={rightToolbarTemplate}
                />
                <DataTable
                    ref={dt}
                    dataKey="id"
                    selection={selectedSpacecrafts}
                    onSelectionChange={(e) => setSelectedSpacecrafts(e.value)}
                    responsiveLayout='scroll'
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    value={spacecrafts}
                    header={header}
                    globalFilter={globalFilter}>
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
                        field="maxSpeed"
                        header='maxSpeed'
                        sortable></Column>
                    <Column
                        field="weigth"
                        header='weigth'
                        sortable></Column>
                    <Column
                        body={rowActions}
                        exportable={false}
                    ></Column>
                </DataTable>
            </div>
            <Dialog
                visible={spacecraftDialog}
                style={{ width: '450px' }}
                header='Spacecraft'
                modal
                className='p-fluid'
                footer={spacecraftDialogFooter}
                onHide={hideDialog}>
                <div className='field'>
                    <label htmlFor='name'>Name</label>
                    <InputTextarea
                        id='name'
                        value={spacecraft.name}
                        onChange={(e) => onInputChange(e, 'name')}
                        required
                        className={classNames({
                            'p-invalid': submitted && !spacecraft.name,
                        })}
                        rows={1}
                    />
                    <label htmlFor='maxSpeed'>maxSpeed</label>
                    <InputTextarea
                        id='maxSpeed'
                        value={spacecraft.maxSpeed}
                        onChange={(e) => onInputChange(e, 'maxSpeed')}
                        required
                        className={classNames({
                            'p-invalid': submitted && !spacecraft.maxSpeed,
                        })}
                        rows={1}
                    />
                    <label htmlFor='weigth'>Weigth</label>
                    <InputTextarea
                        id='weigth'
                        value={spacecraft.weigth}
                        onChange={(e) => onInputChange(e, 'weigth')}
                        required
                        className={classNames({
                            'p-invalid': submitted && !spacecraft.weigth,
                        })}
                        rows={1}
                    />
                    {((submitted && !spacecraft.name) || (submitted && !spacecraft.maxSpeed) || (submitted && !spacecraft.weigth)) && (
                        <small className='p-error'>All data is required.</small>
                    )}
                </div>
            </Dialog>
            <Dialog
                visible={deleteSpacecraftDialog}
                style={{ width: '450px' }}
                header='Confirm'
                modal
                footer={deleteSpacecraftDialogFooter}
                onHide={hideDialog}>
                <div className='confirmation-content'>
                    {spacecraft && (
                        <span>
                            Are you sure you want to delete spacecraft with id <b>{spacecraft.id}</b>?
                        </span>
                    )}
                </div>
            </Dialog>

            <Dialog
                visible={deleteSpacecraftsDialog}
                style={{ width: '450px' }}
                header='Confirm'
                modal
                footer={deleteSpacecraftsDialogFooter}
                onHide={hideDialog}>
                <div className='confirmation-content'>
                    {spacecraft && (
                        <span>Are you sure you want to delete the selected data?</span>
                    )}
                </div>
            </Dialog>
        </div>
    );
};

export default SpacecraftsTable