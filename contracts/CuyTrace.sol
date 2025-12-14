// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CuyTrace {
    enum Estado { CREADO, PROCESADO, EN_TRANSITO, EN_TIENDA, INSPECCIONADO, RECHAZADO, VENDIDO }

    bytes32 public constant ROL_PRODUCTOR = keccak256("PRODUCTOR");
    bytes32 public constant ROL_ACOPIO = keccak256("ACOPIO");
    bytes32 public constant ROL_LOGISTICA = keccak256("LOGISTICA");
    bytes32 public constant ROL_RETAIL = keccak256("RETAIL");
    bytes32 public constant ROL_SENASA = keccak256("SENASA");

    struct Lote {
        uint256 id;
        string producto;
        Estado estado;
        address custodioActual;
        uint256 fechaRegistro;

        bool cadenaFrioOk;
        string ultimasCoordenadas;

        string ipfsCertificadoOrigen;
        string ipfsCertificadoProceso;
        string ipfsActaSenasa;

        address[] historialCustodios;
    }

    mapping(uint256 => Lote) public lotes;
    mapping(address => bytes32) public usuarios;
    uint256 public contadorLotes;

    address public owner;

    event LoteCreado(uint256 indexed id, address productor);
    event CustodiaTransferida(uint256 indexed id, address nuevoCustodio, Estado nuevoEstado);
    event AlertaIoT(uint256 indexed id, string coordenadas, string mensaje);
    event InspeccionSenasa(uint256 indexed id, string ipfsHash);
    event LoteRechazado(uint256 indexed id, address quienRechazo, string motivo);
    event RolAsignado(address indexed wallet, bytes32 rol);

    modifier onlyOwner() {
        require(msg.sender == owner, "Solo admin");
        _;
    }

    modifier soloRol(bytes32 _rol) {
        require(usuarios[msg.sender] == _rol, "No tienes permisos para este rol");
        _;
    }

    modifier loteExiste(uint256 _id) {
        require(_id > 0 && _id <= contadorLotes, "Lote no existe");
        _;
    }

    modifier soloCustodio(uint256 _id) {
        require(lotes[_id].custodioActual == msg.sender, "No tienes la custodia del lote");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setRol(address wallet, bytes32 rol) external onlyOwner {
        usuarios[wallet] = rol;
        emit RolAsignado(wallet, rol);
    }

    function crearLote(string memory _producto, string memory _ipfsOrigen) public soloRol(ROL_PRODUCTOR) {
        contadorLotes++;
        Lote storage l = lotes[contadorLotes];
        l.id = contadorLotes;
        l.producto = _producto;
        l.estado = Estado.CREADO;
        l.custodioActual = msg.sender;
        l.fechaRegistro = block.timestamp;
        l.cadenaFrioOk = true;
        l.ipfsCertificadoOrigen = _ipfsOrigen;
        l.historialCustodios.push(msg.sender);

        emit LoteCreado(contadorLotes, msg.sender);
    }

    function procesarLote(uint256 _id, string memory _ipfsProceso)
        public
        loteExiste(_id)
        soloRol(ROL_ACOPIO)
        soloCustodio(_id)
    {
        Lote storage l = lotes[_id];
        require(l.estado == Estado.CREADO, "Estado invalido para procesar");
        l.estado = Estado.PROCESADO;
        l.ipfsCertificadoProceso = _ipfsProceso;

        emit CustodiaTransferida(_id, msg.sender, Estado.PROCESADO);
    }

    function transferirCustodia(uint256 _id, address _nuevoCustodio, string memory _tipoDestino)
        public
        loteExiste(_id)
        soloCustodio(_id)
    {
        require(_nuevoCustodio != address(0), "Destino invalido");

        Lote storage l = lotes[_id];

        // Validar destino segun tipo (para evitar enviar a quien no corresponde)
        bytes32 t = keccak256(bytes(_tipoDestino));

        if (t == keccak256(bytes("LOGISTICA"))) {
            require(usuarios[_nuevoCustodio] == ROL_LOGISTICA, "Destino no es LOGISTICA");
            require(l.estado == Estado.PROCESADO, "Debe estar PROCESADO");
            l.estado = Estado.EN_TRANSITO;
        } else if (t == keccak256(bytes("RETAIL"))) {
            require(usuarios[_nuevoCustodio] == ROL_RETAIL, "Destino no es RETAIL");
            require(l.estado == Estado.EN_TRANSITO, "Debe estar EN_TRANSITO");
            l.estado = Estado.EN_TIENDA;
        } else if (t == keccak256(bytes("ACOPIO"))) {
            require(usuarios[_nuevoCustodio] == ROL_ACOPIO, "Destino no es ACOPIO");
        }

        l.custodioActual = _nuevoCustodio;
        l.historialCustodios.push(_nuevoCustodio);

        emit CustodiaTransferida(_id, _nuevoCustodio, l.estado);
    }

    function rechazarLote(uint256 _id, string memory _motivo)
        public
        loteExiste(_id)
        soloRol(ROL_RETAIL)
        soloCustodio(_id)
    {
        Lote storage l = lotes[_id];
        require(l.estado == Estado.EN_TIENDA, "Solo se rechaza en tienda");
        l.estado = Estado.RECHAZADO;

        emit LoteRechazado(_id, msg.sender, _motivo);
    }

    function reporteIoT(uint256 _id, int256 _temperatura, string memory _gps)
        public
        loteExiste(_id)
        soloRol(ROL_LOGISTICA)
        soloCustodio(_id)
    {
        Lote storage l = lotes[_id];
        require(l.estado == Estado.EN_TRANSITO, "IoT solo en transito");

        if (_temperatura > 4) {
            l.cadenaFrioOk = false;
            emit AlertaIoT(_id, _gps, "ALERTA: Cadena de frio rota (>4C)");
        }
        l.ultimasCoordenadas = _gps;
    }

    function inspeccionarLote(uint256 _id, string memory _ipfsActa, bool _aprobado)
        public
        loteExiste(_id)
        soloRol(ROL_SENASA)
    {
        Lote storage l = lotes[_id];
        l.ipfsActaSenasa = _ipfsActa;

        if (_aprobado) {
            if (l.estado != Estado.RECHAZADO && l.estado != Estado.VENDIDO) {
                l.estado = Estado.INSPECCIONADO;
            }
        } else {
            l.estado = Estado.RECHAZADO;
        }

        emit InspeccionSenasa(_id, _ipfsActa);
    }

    function obtenerLote(uint256 _id) public view loteExiste(_id) returns (Lote memory) {
        return lotes[_id];
    }
}